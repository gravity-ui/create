declare module 'node:test' {
    namespace test {
        interface MockModuleOptions {
            /**
             * @types/node hasn't caught up with `exports` option yet
             * @see {@link https://nodejs.org/docs/latest-v24.x/api/test.html#mockmodulespecifier-options}
             */
            exports?: object | undefined;
        }
    }
}

export {};
