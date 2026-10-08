const {db} = require('../config/firebase');
const {rows,json} = require('../services/common');
async function loadWorkspace(user) {
  const fs=db(), manager=user.role==='manager', client=user.role==='client';
  let tasks=client?[]:rows(await (manager?fs.collection('tasks'):fs.collection('tasks').where(user.role==='assignee'?'assigneeId':'reviewerId','==',user.uid)).get());
  let projects;
  if(manager) projects=rows(await fs.collection('projects').get());
  else if(client) projects=rows(await fs.collection('projects').where('clientId','==',user.uid).get());
  else { const docs=await Promise.all([...new Set(tasks.map(t=>t.projectId))].map(id=>fs.collection('projects').doc(id).get()));projects=docs.filter(d=>d.exists).map(d=>({...d.data(),id:d.id})); }
  // Clients need task status and milestones to follow delivery, while team
  // members only receive tasks they are assigned to or review.
  if(client) {
    const projectIds=projects.map(p=>p.id);
    tasks=[];
    for(const projectId of projectIds) tasks.push(...rows(await fs.collection('tasks').where('projectId','==',projectId).get()));
  }
  const userIds=[...new Set([
    ...projects.flatMap(p=>[p.clientId,p.managerId].filter(Boolean)),
    ...tasks.flatMap(t=>[t.assigneeId,t.reviewerId].filter(Boolean)),
    user.uid,
  ])];
  const userDocs=await Promise.all(userIds.map(id=>fs.collection('users').doc(id).get()));
  const userMap=new Map(userDocs.filter(d=>d.exists).map(d=>[d.id,{...d.data(),id:d.id}]));
  projects=projects.map(p=>({
    ...p,
    clientName:userMap.get(p.clientId)?.name || 'Client',
    managerName:p.managerId ? userMap.get(p.managerId)?.name || 'Manager' : null,
  }));
  tasks=tasks.map(t=>({
    ...t,
    projectName:projects.find(p=>p.id===t.projectId)?.title || 'Project',
  }));
  const requirements=[],documents=[],feedbacks=[];
 for(const p of projects) {
    const all=tasks.filter(t=>t.projectId===p.id);
   if(client||manager) {p.totalTasks=all.length;p.tasksCompleted=all.filter(t=>t.status==='approved').length;p.progress=all.length?Math.round(100*p.tasksCompleted/all.length):0;}
   p.milestones=all.map(t=>({id:t.id,title:t.title,date:t.deadline,completed:t.status==='approved',phase:t.status==='approved'?'Completed':'In delivery'}));
    requirements.push(...rows(await fs.collection('requirements').where('projectId','==',p.id).get()).map(requirement=>{
      const linked=all.filter(task=>(task.requirementIds || []).includes(requirement.id));
      const status=linked.length && linked.every(task=>task.status==='approved') ? 'Completed' : linked.some(task=>['submitted','in_review'].includes(task.status)) ? 'Under Review' : linked.length ? 'In Progress' : 'Pending';
      return {...requirement,status};
    }));
    documents.push(...rows(await fs.collection('projects').doc(p.id).collection('documents').get()).map(document=>({...document,projectId:p.id})));
   if(client||manager) feedbacks.push(...rows(await fs.collection('feedback').where('projectId','==',p.id).get()));
    if(client) { delete p.memberIds; delete p.teamIds; }
 }
 const submissions=[],reviews=[];
 for(const task of tasks) {
   submissions.push(...rows(await fs.collection('submissions').where('taskId','==',task.id).get()));
   reviews.push(...rows(await fs.collection('reviews').where('taskId','==',task.id).get()));
   if(!manager) task.conflictWith=[]; // teammates' workload is manager-only
 }
 let users;
  if(manager) users=rows(await fs.collection('users').get());
  else {
    const ids=[...new Set([user.uid,...projects.map(project=>project.managerId).filter(Boolean),...tasks.flatMap(t=>[t.assigneeId,t.reviewerId])])];
   users=(await Promise.all(ids.map(id=>fs.collection('users').doc(id).get()))).filter(d=>d.exists).map(d=>({...d.data(),id:d.id}));
   users=users.map(u=>u.id===user.uid?u:{id:u.id,name:u.name,role:u.role,email:'',createdAt:u.createdAt});
 }
 let activities=rows(await (manager?fs.collection('activityLogs').orderBy('createdAt','desc').limit(100):fs.collection('activityLogs').where('audienceIds','array-contains',user.uid)).get());
 if(client) activities=activities.filter(a=>projects.some(p=>p.id===a.projectId)&&!['task','review','submission'].includes(a.targetType));
 const notifications=rows(await fs.collection('notifications').where('userId','==',user.uid).get());
 return json({projects,tasks,users,requirements,documents,feedbacks,submissions,reviews,activities,notifications});
}
module.exports={loadWorkspace,workspace:async(req,res)=>res.json(await loadWorkspace(req.user))};
