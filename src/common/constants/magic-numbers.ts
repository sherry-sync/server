// common

export const defaultPort = 3000;

// crypto
export const cryptoIterations = 1000;
export const cryptoKeylen = 64;
export const cryptoDigest = 'sha512';

// auth
export const minLengthPasswordValidation = 6;
export const minLengthUsernameValidation = 4;
export const passwordMatchPattern = /^(?=.*[A-Z])(?=.*\d).+/;

// sherry config

export const defaultMaxFileSize = 500;
export const defaultMaxDirectorySize = 1000;

export const isDirectoryAllowed = true;
