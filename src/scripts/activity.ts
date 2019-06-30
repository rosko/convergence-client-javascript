#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";
import {Convergence} from "../main/ts/";

const log = Convergence.logging.root();

connect()
  .then(domain => {
    return domain.activities().join("foo", {state: {foo: "bar"}});
  })
  .then(activity => {
    log.info("Activity Joined");
  })
  .catch(e => console.error(e));

process.stdin.resume();
