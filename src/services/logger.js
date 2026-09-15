import { appendFileSync } from 'fs';


const appPrefix = '----------';



export const logger = {

    stream: {

        stdout: function(data) {
            process.stdout.write(data);
        },

        stderr: function(data) {
            process.stderr.write(data);
        },
    },

    app: {

        info: function({ message, file }) {
            console.log(`${appPrefix} ${message}`);
            if (file) {
                appendFileSync(file, message);
            }
        },

        error: function({ message, file }) {
            console.error(`${appPrefix} ${message}`);
            if (file) {
                appendFileSync(file, message);
            }
        },
    }

}
