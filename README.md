# Logging Configuration with Winston

**Winston** is a logging library for Node.js, designed to be simple to use, flexible, and extensible. It allows structured logging and supports multiple formats and destinations (transports) such as the console, files, databases, or remote services.

## Key Features of Winston

1. **Multiple Transports**: Winston enables defining multiple transports, meaning logs can be sent simultaneously to different destinations, such as the console, local files, or services like Loggly, AWS CloudWatch, etc.

2. **Custom Log Levels**: You can define log levels like info, warn, error, etc., and filter messages based on their importance.

3. **Flexible Formats**: Winston provides the ability to format logs as needed: JSON, plain text, or custom formats. This allows adapting the display for development (e.g., with colors) or production (more formal formats like JSON).

4. **Exception and Rejection Handling**: It captures uncaught exceptions and unhandled promise rejections, ensuring no errors go unnoticed.

5. **File Rotation**: Using extensions like `winston-daily-rotate-file`, Winston can automatically rotate log files based on size or date (e.g., one file per day).

## My Winston Configuration for Managing Logs

In this configuration, Winston captures logs of different levels (info, warn, error, debug) and saves them in separate files with daily rotation to avoid large file sizes. In production, logs are filtered starting from the **debug** level to prevent log saturation. For development, simplified and colored output is displayed in the console. Here are the details:

```typescript
import winston, { createLogger, format, transports } from 'winston'; // Import Winston logging library and necessary components
import DailyRotateFile from 'winston-daily-rotate-file'; // Import the DailyRotateFile transport for log rotation

const { colorize, align } = winston.format; // Destructure format utilities from Winston

// Define the log level based on the environment (e.g., production or development).
// This is done to filter certain logs and prevent verbose logs from being sent in production.
const logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Function to create a transport for daily log rotation, which includes the filename pattern, log level, and maximum number of days to keep logs.
const createTransport = (filename: string, level: string, maxFiles: number) => {
  return new DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`, // Log filename with date pattern
    datePattern: 'YYYY-MM-DD', // Date format for the logs
    zippedArchive: true, // Archive old log files as zip files
    maxSize: '30m', // Maximum size for each log file (30 MB)
    maxFiles: `${maxFiles}d`, // Maximum number of days to retain log files
    level, // Log level (info, warn, debug, error, etc.)
  });
};

// Transport for general logs
const transport = createTransport('application', 'info', 14);

// Transport for warning logs
const warnTransport = createTransport('warns', 'warn', 21);

// Transport for debug logs
const debugTransport = createTransport('debugs', 'debug', 21);

// Transport for error logs
const errorTransport = createTransport('errors', 'error', 30);

/**
 * Creates a Winston logger configured to log to daily rotating files.
 * This logger handles general logs, warning logs, and error logs.
 * It also manages uncaught exceptions and unhandled promise rejections.
 */
const log = createLogger({
  level: logLevel, // Set the log level based on the environment
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss', // Timestamp format for logs
    }),
    format.errors({ stack: true }), // Include stack traces for error logs
    align(), // Align log messages for better readability
    process.env.NODE_ENV === 'production' // Check if the environment is production
      ? format.json() // In production, log in JSON format
      : format.prettyPrint() // In development, log in a more readable format
  ),
  defaultMeta: {
    service: 'user-service', // Default metadata for logs (service name)
  },
  transports: [
    process.env.NODE_ENV === 'production'
      ? new transports.Console({
          format: format.combine(
            format.timestamp(), // Add timestamp to console logs
            format.json() // Log to console in JSON format in production
          ),
          level: 'info', // Display only 'info' and above logs in production
        })
      : new transports.Console({
          format: format.combine(
            colorize({ all: true }), // Colorize log output in the console
            format.printf(({ level, message, timestamp }) => {
              return `${timestamp} [${level}]: ${message}`; // Custom format for console logs
            })
          ),
          level: 'debug', // Display all log levels in development
        }),
    transport, // General logs with daily rotation
    errorTransport, // Log errors to a separate file with daily rotation
    warnTransport, // Log warnings to a separate file with daily rotation
    debugTransport, // Log debug information to a separate file with daily rotation
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }), // Handle uncaught exceptions and log them to a file
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }), // Handle unhandled promise rejections and log them to a file
  ],
});

export default log; // Export the logger instance for use in other parts of the application
```

### Example Usage

```typescript
import log from './core/logger'; // Replace with your logger path

log.info("This is an info message");
log.warn("This is a warning message");
log.error("This is an error message");
log.debug("This is a debug message");
```

### Console Output Example

![alt text](public/logResult.png)

## Integrating Morgan with Winston

To capture HTTP requests, Morgan (a logging middleware for Express) can be integrated with Winston by redirecting HTTP logs to Winston. Here's how to configure it:

```typescript
import morgan from 'morgan'; // Import Morgan
import log from './core/logger'; // Import your logger file

// Logging middleware with Morgan using Winston
app.use(morgan(':method :url  :status :response-time ms', {
 stream: {
  write: (message) => log.http(message.trim()) // Redirect HTTP Log through winston
 }
 }));
// Here, `app` is an instance of Express (`const app = express();`)
```

## Tip: Disable Console Logs in Production

Console logs such as `console.log` and `console.warn` should not be used in production as they can harm performance by generating unnecessary noise in the logs. They can also expose sensitive information, compromising security. Additionally, they lack advanced features like log levels and file rotation, making it harder to track errors and maintain the application. Using a logger like Winston provides better control and professional log management in production. Here's how to disable them if they were accidentally left in the code during development:

```typescript
import { Request, Response, NextFunction } from "express";
import 'dotenv/config'
const disableLogsInProduction = (_req: Request, _res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
        console.log = () => { };
        console.warn = () => { };
        console.error = () => { };
        console.info = () => { };
        console.debug = () => { };
    }
    next();
};

export default disableLogsInProduction;
```

Then use it in the configuration or server file:

```typescript
import express from 'express';
import disableLogsInProduction from './middleware/disableLog';

const app = express();

// Disable console logs in production
app.use(disableLogsInProduction); // Middleware to disable logs
```
