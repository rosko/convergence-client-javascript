import {HandshakeResponse} from "./protocol/handhsake";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {ProtocolConnection} from "./ProtocolConnection";
import {debugFlags} from "../Debug";
import ConvergenceSocket from "./ConvergenceSocket";
import {OutgoingProtocolMessage} from "./protocol/protocol";
import {OutgoingProtocolRequestMessage} from "./protocol/protocol";
import {IncomingProtocolResponseMessage} from "./protocol/protocol";
import EventEmitter from "../util/EventEmitter";
import SessionImpl from "../SessionImpl";
import ConvergenceDomain from "../ConvergenceDomain";
import Session from "../Session";
import {PasswordAuthRequest} from "./protocol/authentication";
import MessageType from "./protocol/MessageType";
import {TokenAuthRequest} from "./protocol/authentication";
import {AuthRequest} from "./protocol/authentication";
import {AuthenticationResponse} from "./protocol/authentication";
import Deferred from "../util/Deferred";
import {ReplyCallback} from "./ProtocolConnection";
import {EventKey} from "../util/EventEmitter";

export default class ConvergenceConnection extends EventEmitter {

  static Events: any = {
    CONNECTED: "connected",
    INTERRUPTED: "interrupted",
    RECONNECTED: "reconnected",
    DISCONNECTED: "disconnected",
    ERROR: "error"
  };

  private _session: SessionImpl;
  private _connectionDeferred: Deferred<HandshakeResponse>;
  private _connectionTimeout: number;  // seconds
  private _maxReconnectAttempts: number;
  private _connectionAttempts: number;
  private _connectionAttemptTask: number;
  private _connectionTimeoutTask: number;
  private _reconnectInterval: number; // seconds
  private _retryOnOpen: boolean;

  private _protocolConfig: ProtocolConfiguration;

  private _clientId: string;
  private _reconnectToken: string;

  private _connectionState: ConnectionState;

  private _protocolConnection: ProtocolConnection;
  private _url: string;
  private _messageEmitter: EventEmitter;

  /**
   *
   * @param url
   * @param connectionTimeout in seconds
   * @param maxReconnectAttempts -1 for unlimited
   * @param reconnectInterval in seconds
   * @param retryOnOpen
   */
  constructor(url: string,
              connectionTimeout: number,
              maxReconnectAttempts: number,
              reconnectInterval: number,
              retryOnOpen: boolean,
              domain: ConvergenceDomain) {
    super();
    this._url = url;

    this._connectionTimeout = connectionTimeout;
    this._maxReconnectAttempts = maxReconnectAttempts;
    this._reconnectInterval = reconnectInterval;
    this._retryOnOpen = retryOnOpen;

    this._connectionAttempts = 0;
    this._connectionState = ConnectionState.DISCONNECTED;

    // fixme
    this._protocolConfig = {
      defaultRequestTimeout: 1000,
      heartbeatConfig: {
        enabled: true,
        pingInterval: 5000,
        pongTimeout: 10000
      }
    };

    this._messageEmitter = new EventEmitter();

    this._session = new SessionImpl(domain, this, null, null, null);
  }

  session(): Session {
    return this._session;
  }

  connect(): Promise<HandshakeResponse> {
    if (this._connectionState !== ConnectionState.DISCONNECTED) {
      throw new Error("Can only call connect on a disconnected connection.");
    }

    this._connectionAttempts = 0;
    this._connectionDeferred = new Deferred<HandshakeResponse>();
    this._connectionState = ConnectionState.CONNECTING;

    this._attemptConnection(false);

    return this._connectionDeferred.promise();
  }

  disconnect(): Promise<void> {
    // todo we might not need this.  refactor.
    var deferred: Deferred<void> = new Deferred<void>();

    if (this._connectionTimeoutTask != null) {
      clearTimeout(this._connectionTimeoutTask);
      this._connectionTimeoutTask = null;
    }

    if (this._connectionAttemptTask != null) {
      clearTimeout(this._connectionAttemptTask);
      this._connectionAttemptTask = null;
    }

    if (this._connectionDeferred != null) {
      this._connectionDeferred.reject(new Error("Connection canceled by user"));
      this._connectionDeferred = null;
    }

    if (this._connectionState === ConnectionState.DISCONNECTED) {
      deferred.reject(new Error("Connection is already disconnected."));
    }

    this._connectionState = ConnectionState.DISCONNECTING;

    return this._protocolConnection.close().then(() => {
      this._connectionState = ConnectionState.DISCONNECTED;
    }).catch((reason: Error) => {
      this._connectionState = ConnectionState.INTERRUPTED;
    });
  }

  isConnected(): boolean {
    return this._connectionState === ConnectionState.CONNECTED;
  }

  send(message: OutgoingProtocolMessage): void {
    this._protocolConnection.send(message);
  }

  request(message: OutgoingProtocolRequestMessage): Promise<IncomingProtocolResponseMessage> {
    return this._protocolConnection.request(message);
  }

  authenticateWithPassword(username: string, password: string): Promise<void> {
    var authRequest: PasswordAuthRequest = {
      type: MessageType.PASSWORD_AUTH_REQUEST,
      username: username,
      password: password
    };
    return this._authenticate(authRequest);
  }

  authenticateWithToken(token: string): Promise<void> {
    var authRequest: TokenAuthRequest = {
      type: MessageType.TOKEN_AUTH_REQUEST,
      token: token
    };
    return this._authenticate(authRequest);
  }

  addMessageListener(type: EventKey, listener: (message: any) => void): void {
    this._messageEmitter.on(type, listener);
  }

  addMultipleMessageListener(types: EventKey[], listener: (message: any) => void): void {
    types.forEach((type: string) => {
      this._messageEmitter.on(type, listener);
    });
  }

  removeMessageListener(type: EventKey, listener: (message: any) => void): void {
    this._messageEmitter.off(type, listener);
  }

  private _authenticate(authRequest: AuthRequest): Promise<void> {
    if (this._session.isAuthenticated()) {
      // The user is only allowed to authenticate once.
      return Promise.reject<void>(new Error("User already authenticated."));
    } else if (this.isConnected()) {
      // We are connected already so we can just send the request.
      return this._sendAuthRequest(authRequest);
    } else if (this._connectionDeferred != null) {
      // We are connecting so defer this until after we connect.
      return this._connectionDeferred.promise().then( () => {
        return this._sendAuthRequest(authRequest);
      });
    } else {
      // We are not connecting and are not trying to connect.
      return Promise.reject<void>(new Error("Must be connected or connecting to authenticate."));
    }
  }

  private _sendAuthRequest(authRequest: AuthRequest): Promise<void> {
    return this.request(authRequest).then((response: AuthenticationResponse) => {
      if (response.success === true) {
        this._session._setUsername(response.username);
        this._session._setUserId(response.userId);
        this._session.setAuthenticated(true);
        return;
      } else {
        throw new Error("Authentication failed");
      }
    });
  }

  private _attemptConnection(reconnect: boolean): void {
    this._connectionAttempts++;

    if (reconnect) {
      if (debugFlags.serverConnection) {
        console.log("Attempting reconnection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
      }
    } else {
      if (debugFlags.serverConnection) {
        console.log("Attempting connection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
      }
    }

    var timeoutTask: Function = () => {
      this._protocolConnection.abort("connection timeout exceeded");
    };

    this._connectionTimeoutTask = setTimeout(timeoutTask, this._connectionTimeout * 1000);

    var socket: ConvergenceSocket = new ConvergenceSocket(this._url);
    this._protocolConnection = new ProtocolConnection(
      socket,
      this._protocolConfig);

    this._protocolConnection.on(ProtocolConnection.Events.ERROR, (error: string) =>
      this.emit(ConvergenceConnection.Events.ERROR, error));

    this._protocolConnection.on(ProtocolConnection.Events.DROPPED, () =>
      this.emit(ConvergenceConnection.Events.INTERRUPTED));

    this._protocolConnection.on(ProtocolConnection.Events.CLOSED, () =>
      this.emit(ConvergenceConnection.Events.DISCONNECTED));

    this._protocolConnection.on(ProtocolConnection.Events.MESSAGE, (event: MessageEvent) => {
      this._messageEmitter.emit(event.message.type, event);
    });

    this._protocolConnection.connect().then(() => {
      if (debugFlags.connection) {
        console.log("Connection succeeded, handshaking.");
      }

      this._protocolConnection.handshake(reconnect).then((handshakeResponse: HandshakeResponse) => {
        clearTimeout(this._connectionTimeoutTask);
        if (handshakeResponse.success) {
          this._connectionDeferred.resolve(handshakeResponse);
          this._connectionDeferred = null;
          this._clientId = handshakeResponse.sessionId;
          this._session._setSessionId(handshakeResponse.sessionId);
          this._reconnectToken = handshakeResponse.reconnectToken;
          if (reconnect) {
            this.emit(ConvergenceConnection.Events.RECONNECTED);
          } else {
            this.emit(ConvergenceConnection.Events.CONNECTED);
          }
        } else {
          // todo: Can we reuse this connection???
          this._protocolConnection.close();
          if ((reconnect || this._retryOnOpen) && handshakeResponse.retryOk) {
            // todo if this is a timeout, we would like to shorten
            // the reconnect interval by the timeout period.
            this._scheduleReconnect(this._reconnectInterval, reconnect);
          } else {
            this.emit(ConvergenceConnection.Events.DISCONNECTED);
            this._connectionDeferred.reject(new Error("Server rejected handshake request."));
            this._connectionDeferred = null;
          }
        }
      }).catch((e: Error) => {
        console.error("Handshake failed: ", e);
        this._protocolConnection.close();
        this._protocolConnection = null;
        this._connectionDeferred = null;
        clearTimeout(this._connectionTimeoutTask);
        this._scheduleReconnect(this._reconnectInterval, reconnect);
        this.emit(ConvergenceConnection.Events.DISCONNECTED);
      });
    }).catch((reason: Error) => {
      console.error("Connection failed: ", reason);
      clearTimeout(this._connectionTimeoutTask);
      if (reconnect || this._retryOnOpen) {
        this._scheduleReconnect(Math.max(this._reconnectInterval, 0), reconnect);
      } else {
        this._connectionDeferred.reject(reason);
        this._connectionDeferred = null;
        this.emit(ConvergenceConnection.Events.DISCONNECTED);
      }
    });
  }

  private _scheduleReconnect(delay: number, reconnect: boolean): void {
    if (this._connectionAttempts < this._maxReconnectAttempts || this._maxReconnectAttempts < 0) {
      var reconnectTask: Function = () => {
        this._attemptConnection(reconnect);
      };
      this._connectionAttemptTask = setTimeout(reconnectTask, delay * 1000);
    } else {
      this._connectionDeferred.reject(new Error("Maximum connection attempts exceeded"));
    }
  }
}

export interface MessageEvent {
  message: any; // Model Message??
  request: boolean;
  callback?: ReplyCallback;
}


enum ConnectionState {
  DISCONNECTED, CONNECTING, CONNECTED, INTERRUPTED, DISCONNECTING
}
