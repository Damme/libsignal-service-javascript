/*
 * vim: ts=2:sw=2:expandtab
 */

"use strict";

// eslint-disable-next-line func-names
function appendStack(newError, originalError) {
  // eslint-disable-next-line no-param-reassign
  newError.stack += `\nOriginal stack:\n${originalError.stack}`;
}

class ReplayableError extends Error {
  constructor(options = {}) {
    super(options.message);
    this.name = options.name || "ReplayableError";
    this.message = options.message;

    // Maintains proper stack trace, where our error was thrown (only available on V8)
    //   via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
    }

    this.functionCode = options.functionCode;
  }
}

class IncomingIdentityKeyError extends ReplayableError {
  constructor(identifier, message, key) {
    this.identifier = identifier.split(".")[0];
    super({
      name: "IncomingIdentityKeyError",
      message: `The identity of ${this.identifier} has changed.`
    });
    this.identityKey = key;
  }
}

class OutgoingIdentityKeyError extends ReplayableError {
  constructor(identifier, message, timestamp, identityKey) {
    this.identifier = identifier.split(".")[0];
    super({
      name: "OutgoingIdentityKeyError",
      message: `The identity of ${this.identifier} has changed.`
    });
    this.identityKey = identityKey;
  }
}

class OutgoingMessageError extends ReplayableError {
  constructor(identifier, message, timestamp, httpError) {
    super({
      name: "OutgoingMessageError",
      message: httpError ? httpError.message : "no http error"
    });
    this.identifier = identifier.split(".")[0];
    if (httpError) {
      this.code = httpError.code;
      appendStack(this, httpError);
    }
  }
}

class SendMessageNetworkError extends ReplayableError {
  constructor(identifier, jsonData, httpError) {
    super({
      name: "SendMessageNetworkError",
      message: httpError.message
    });
    this.identifier = identifier;
    this.code = httpError.code;
    appendStack(this, httpError);
  }
}

class SignedPreKeyRotationError extends ReplayableError {
  constructor() {
    super({
      name: "SignedPreKeyRotationError",
      message: "Too many signed prekey rotation failures"
    });
  }
}

class MessageError extends ReplayableError {
  constructor(message, httpError) {
    super({
      name: "MessageError",
      message: httpError.message
    });
    this.code = httpError.code;
    appendStack(this, httpError);
  }
}

class UnregisteredUserError extends Error {
  constructor(identifier, httpError) {
    super(httpError.message);
    this.message = httpError.message;
    this.name = "UnregisteredUserError";
    // Maintains proper stack trace, where our error was thrown (only available on V8)
    //   via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
    }
    this.identifier = identifier;
    this.code = httpError.code;
    appendStack(this, httpError);
  }
}

module.exports.UnregisteredUserError = UnregisteredUserError;
module.exports.SendMessageNetworkError = SendMessageNetworkError;
module.exports.IncomingIdentityKeyError = IncomingIdentityKeyError;
module.exports.OutgoingIdentityKeyError = OutgoingIdentityKeyError;
module.exports.ReplayableError = ReplayableError;
module.exports.OutgoingMessageError = OutgoingMessageError;
module.exports.MessageError = MessageError;
module.exports.SignedPreKeyRotationError = SignedPreKeyRotationError;
