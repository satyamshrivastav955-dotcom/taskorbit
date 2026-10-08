const {db} = require('../config/firebase');
const {rows,notify} = require('./common');
async function sendDeadlineReminders(now=new Date()) {
 const fs=db(), today=now.toISOString().slice(0,10), end=new Date(today+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+3);
 const tasks=rows(await fs.collection('tasks').where('deadline','<=',end).get());
 let sent=0;
 for(const t of tasks) {
  if(t.status==='approved') continue;
  const date=t.deadline.toDate?t.deadline.toDate():new Date(t.deadline);
  if(date.toISOString().slice(0,10)<today) continue;
  const id='deadline-'+t.id+'-'+today;
  await fs.runTransaction(async tx=>{
   const ref=fs.collection('notifications').doc(id);
   if((await tx.get(ref)).exists) return;
   notify(tx,t.assigneeId,'Deadline approaching: '+t.title,'deadline','/assignee/tasks/'+t.id,id);sent++;
  });
 }
 return sent;
}
function startDeadlineJob() { const run=()=>sendDeadlineReminders().catch(e=>console.error('Deadline reminders:',e.message));void run();const timer=setInterval(run,60*60*1000);timer.unref();return timer; }
module.exports={sendDeadlineReminders,startDeadlineJob};
