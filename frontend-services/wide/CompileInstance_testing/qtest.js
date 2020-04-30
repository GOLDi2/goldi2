let Queue = require('better-queue');

// function fn (sec, cb) {
//     setTimeout(() => {
//         console.log(`Waited ${sec} seconds`);
//         cb();
//     }, sec * 1000);
// }

// let queue = new Queue(fn);

// queue.push('1');
// queue.push('3');
// queue.push('2');
// queue.push('3');

var counter = new Queue(function (task, cb) {
    console.log("I have %d %ss.", task.count, task.id);
    cb();
}, {
    merge: function (oldTask, newTask, cb) {
      oldTask.count += newTask.count;
      cb(null, oldTask);
    }
})
counter.push({ id: 'apple', count: 2 });
counter.push({ id: 'apple', count: 1 });
counter.push({ id: 'orange', count: 1 });
counter.push({ id: 'orange', count: 1 });