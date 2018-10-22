#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";

connect()
  .then(domain => {
    console.log("connected");
    return domain.activities().join("foo");
  })
  .then(activity => {
    console.log("Activity Joined");
  })
  .catch(e => console.error(e));
