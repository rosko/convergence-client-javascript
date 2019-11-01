import {ConvergenceError} from "../util";
import {DomainUser} from "./DomainUser";
import {fromOptional, protoToDomainUserType, protoToDomainUserId} from "../connection/ProtocolUtil";
import {UserField} from "./IdentityService";
import {io} from "@convergence/convergence-proto";
import IDomainUserData = io.convergence.proto.IDomainUserData;
import IUserGroupData = io.convergence.proto.IUserGroupData;
import { UserGroup } from "./UserGroup";

/**
 * @hidden
 * @internal
 */
export function toUserFieldCode(field: UserField): number {
  switch (field) {
    case "username":
      return 1;
    case "email":
      return 2;
    case "firstName":
      return 3;
    case "lastName":
      return 4;
    case "displayName":
      return 5;
    default:
      throw new ConvergenceError("Invalid user field: " + field);
  }
}

/**
 * @hidden
 * @internal
 */
export function toDomainUser(userData: IDomainUserData): DomainUser {
  return new DomainUser(
    protoToDomainUserType(userData.userId.userType),
    userData.userId.username,
    fromOptional(userData.firstName),
    fromOptional(userData.lastName),
    fromOptional(userData.displayName),
    fromOptional(userData.email));
}

/**
 * @hidden
 * @internal
 */
export function toUserGroup(userData: IUserGroupData): UserGroup {
  return new UserGroup(
    userData.id,
    userData.description,
    userData.members ? userData.members.map(m => protoToDomainUserId(m).username) : []
  );
}
