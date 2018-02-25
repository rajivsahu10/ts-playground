
// import * as nodeApi from './node_modules/@types/node/index.d.ts'
import path from "path";
import fs from "fs";
import child_process from "child_process";

// git command 
// git -C d:angular\\angularWorkspace\\my-first-app log --remotes=origin --numstat --pretty=oneline --date=short -2 --format="AuthorName:%aN%nAuthorEmail:%aE%nAuthorDate:%ad%nSubject:%s"

class LogProcessor {

    private processCmdOutput(gitLog : string): void  {
        console.log("GitLog : START");
        if (gitLog==null || gitLog.length==0) {
            throw new Error();            
        }
        console.log(gitLog);
        console.log("GitLog : END");
    }

    public start() {
        console.log("inside start")
        let gitLogCmd : string = 'git -C d:/angular/angularWorkspace/my-first-app log --remotes=origin --numstat --pretty=oneline --date=short -2 --format="AuthorName:%aN%nAuthorEmail:%aE%nAuthorDate:%ad%nSubject:%s"'
        child_process.exec(gitLogCmd,(errorObj, stdout, stderr) => {
            if (errorObj instanceof Error) {
                console.error(errorObj)
                throw errorObj;
            }
                        
            if (stdout != null) {
                this.processCmdOutput(stdout);
            }

            if(stderr != null && stderr.length > 0) {
                console.log('stderr ', stderr);
            }            
        });        
    }
}

const myApp = new LogProcessor();
myApp.start();