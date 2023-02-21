import {ChildProcessWithoutNullStreams} from 'child_process';
import {Router} from 'express';

interface StreamData {
  all: string;
}
interface ApplicationData {
  process: ChildProcessWithoutNullStreams;
  stdout: StreamData;
  stderr: StreamData;
}

export function createProcessInterface(router: Router, base: string, createProcess?: () => ChildProcessWithoutNullStreams) {
  let pending_process: ApplicationData | undefined = undefined;

  function prepareProcess(process: ChildProcessWithoutNullStreams) {
    pending_process = {process, stderr: {all: ''}, stdout: {all: ''}};
    function appendFun(stream: StreamData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data: any) => {
        stream.all += data.toString();
        console.log(data.toString());
      };
    }
    pending_process?.process.stdout.on('data', appendFun(pending_process.stdout));
    pending_process?.process.stderr.on('data', appendFun(pending_process.stderr));
    pending_process?.process.on('close', () => {
      pending_process = undefined;
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    pending_process?.process.stdin.on('error', () => {});
  }

  router.get(base + '/stream', (_req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-control': 'no-cache',
    });

    if (!pending_process) {
      if (!createProcess) {
        res.end();
        return;
      }
      prepareProcess(createProcess());
    } else {
      if (pending_process.stdout.all.length > 0) res.write('data: ' + JSON.stringify(pending_process.stdout.all) + '\n\n');
      if (pending_process.stderr.all.length > 0) res.write('stderr: ' + JSON.stringify(pending_process.stderr.all) + '\n\n');
    }

    pending_process?.process.stdout.on('data', data => {
      res.write('data: ' + JSON.stringify(data.toString()) + '\n\n');
    });
    pending_process?.process.stderr.on('data', data => {
      res.write('data: ' + JSON.stringify(data.toString()) + '\n\n');
    });
    pending_process?.process.on('close', function () {
      res.end();
    });
  });

  router.get(base + '/input', (req, res) => {
    if (!pending_process) {
      if (!createProcess) {
        res.sendStatus(404);
        return;
      }
      prepareProcess(createProcess());
    }
    try {
      const input = decodeURI(req.query.input as string);
      if (pending_process?.process.stdin.writable) {
        pending_process?.process.stdin.cork();
        pending_process?.process.stdin.write(input);
        pending_process?.process.stdin.uncork();
        res.sendStatus(204);
      }
    } catch (e) {
      res.sendStatus(500);
    }
  });

  return {
    setProcess: prepareProcess,
    isRunning: () => pending_process !== undefined,
  };
}
