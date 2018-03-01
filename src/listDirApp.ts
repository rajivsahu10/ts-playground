
// import * as nodeApi from './node_modules/@types/node/index.d.ts'
import path from "path";
import FS from "fs";
import child_process from "child_process";
import OS from "os";

// git command 
// git -C d:angular\\angularWorkspace\\my-first-app log --remotes=origin --numstat --pretty=oneline --date=short -2 --format="AuthorName:%aN%nAuthorEmail:%aE%nAuthorDate:%ad%nSubject:%s"

class DiffStats {
    constructor(public locAdded: Number,
                public lodDeleted: Number,
                public filetype: string,
                public fileName: string) {
    }
}

class Commit {
    private diffStats : DiffStats[] = [];    
    constructor(public authorName: string, 
                public authorEmail: string,
                public authorDate: string,
                public subject: string,
                ) {        
    }
    

    public addDiffStats(diffStat: DiffStats): number {
        return this.diffStats.push(diffStat);
    }

    public getDiffStats(): DiffStats[] {
        return this.diffStats;
    }

    public setDiffStats(diffStatsArray: DiffStats[]) {
        diffStatsArray.forEach(entry => {
            this.diffStats.push(entry);
        });        
    }
}

class LogProcessor {

    private processCommitInfo(rawCommit: string): Commit {
        // match commit headers :  [a-zA-Z]*:.*
        let commitInfoLines: RegExpMatchArray|null = rawCommit.match(/[a-zA-Z]*:.*/g);
        
        let authorName: string = "";
        let authorEmail:string="";
        let authorDate: string = "";
        let subject: string = "";

        if (commitInfoLines!==null) {
            commitInfoLines.forEach(commitInfoEntry => {
                // console.log("--> " + lineEntry);
                //this.processRawCommit(rawCommit);
                let indexOfSeparator:number = commitInfoEntry.indexOf(":")===undefined ? 0 : commitInfoEntry.indexOf(":");
                let key: string = commitInfoEntry.substr(0, indexOfSeparator);
                let value: string = commitInfoEntry.substring(indexOfSeparator);
                switch (key) {
                    case "AuthorName":
                        authorName = value; 
                        break;
                
                    case "AuthorEmail":
                        authorEmail = value;
                        break;

                    case "AuthorDate": 
                        authorDate = value;
                        break;
                    
                    case "Subject":
                        subject = value;
                        break;
                }
                
            });    
        }
        return new Commit(authorName, authorEmail, authorDate, subject);
    }
    private processCommitDiffStats(rawCommit: string):DiffStats[] {
        // match commit diffs   :  [\d]*\t[\d]*\t.*
        let diffStatsLines: RegExpMatchArray|null = rawCommit.match(/[\d]*\t[\d]*\t.*/g);
        let diffStats: DiffStats[] = [];
        if (diffStatsLines !== null) {
            diffStatsLines.forEach(diffStatEntry => {
                let values:string[] = diffStatEntry.split(/\t/g);
                let locAdded:Number = new Number(values[0]);
                let locDeleted:Number = new Number(values[1]);
                let fileName:string = values[2].replace(/\//g,".");
                let filetype:string = fileName.substr(fileName.lastIndexOf(".")+1);
                let diffStatObject:DiffStats = new DiffStats(locAdded, locDeleted, filetype, fileName);
                diffStats.push(diffStatObject);
            });
        }
        return diffStats;
    }
    private processRawCommit(rawCommit: string): Commit {
        let commit: Commit = this.processCommitInfo(rawCommit);
        let diffStats: DiffStats[] = this.processCommitDiffStats(rawCommit);
        commit.setDiffStats(diffStats);
        return commit;
    }
    private processCmdOutput(gitLog : string): void  {
        console.log("GitLog : START");
        if (gitLog==null || gitLog.length==0) {
            throw new Error();            
        }
        // console.log(gitLog);
        // console.log("current eol : " + OS.EOL);
        let commitsAll : Commit[] = [];
        // working regex : /AuthorName(.*\n){4}(([\d|\-]*\t[\d|\-]*\t.*\n)|\n)*/g
        let commitSnippets: RegExpMatchArray|null = gitLog.match(/AuthorName(.*\n){4}(([\d|\-]*\t[\d|\-]*\t.*\n)|\n)*/g);
        if (commitSnippets!==null) {
            commitSnippets.forEach(rawCommit => {
                // console.log("--> " + lineEntry);
                let commit: Commit = this.processRawCommit(rawCommit);
                commitsAll.push(commit);
            });    
        }
        
        console.log(commitsAll);
        console.log("------- now write JSON --------");
        //console.log(commitsAllJSON);
        new OutputFileGenerator(commitsAll).generateFile();
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

class OutputFileGenerator {
    constructor(public commits: Commit[] ) {          
    }

    public generateFile(): void {
        let commitsJSON: string = JSON.stringify(this.commits, null, 4);
        FS.writeFileSync("myLog.json",commitsJSON);
    }
}
const myApp = new LogProcessor();
myApp.start();