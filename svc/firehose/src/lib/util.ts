import chalk from "chalk";

export type LogUnit = {
    type: "level" | "service";
    string: string;
} | undefined;

export const logLevels: Record<string, LogUnit> = {
    "debug": {
        type: "level",
        string: chalk["magenta"]["bold"]("[DEBUG]")
    },
    "info": {
        type: "level",
        string: chalk["blue"]["bold"]("[INFO]")
    },
    "warn": {
        type: "level",
        string: chalk["yellow"]["bold"]("[WARN]")
    },
    "error": {
        type: "level",
        string: chalk["red"]["bold"]("[ERROR]")
    },
};

export const logServices: Record<string, LogUnit> = {
    "server": {
        type: "service",
        string: chalk["green"]["bold"]("[SERVER]")
    },
    "grpc-bus": {
        type: "service",
        string: chalk["magenta"]["bold"]("[GRPC BUS]")
    }
};

export const uniformLog = (logLevel: LogUnit, logService: LogUnit, ...args: any[]): void => {
    console.log(
        chalk["red"]["bold"]("[FIREHOSE]"),
        logLevel?.string ?? logLevels["info"]?.string,
        logService?.string ?? logServices["server"]?.string,
        ...args,
        chalk.gray("(" + new Date().toISOString() + ")")
    );
};