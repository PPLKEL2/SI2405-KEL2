'use strict';

// Error yang punya HTTP status, dilempar oleh service dan diubah jadi response di server.
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = { AppError };
