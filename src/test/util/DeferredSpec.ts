/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {expect} from "chai";
import {Deferred} from "../../main/util/Deferred";

describe("DeferredSpec", () => {

  it("calling resolve on the deferred must resolve the promise with the correct valeue", (done) => {
    const resolveVal: string = "resolve";

    const def: Deferred<string> = new Deferred<string>();
    def.promise().then((val: string) => {
      expect(val).to.equal(resolveVal);
      done();
    }).catch(() => {
      done(new Error("The promise was rejected, when it was supposed to be resolved."));
    });

    def.resolve(resolveVal);
  });

  it("calling reject on the deferred must reject the promise with the correct error", (done) => {
    const rejectError: Error = new Error("Test Error");

    const def: Deferred<string> = new Deferred<string>();
    def.promise().then(() => {
      done(new Error("The promise was resolved, when it was supposed to be rejected."));
    }).catch((error: Error) => {
      expect(error).to.equal(rejectError);
      done();
    });

    def.reject(rejectError);
  });
});