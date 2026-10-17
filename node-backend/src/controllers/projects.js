const {db} = require('../config/firebase');
const {assert,fail,text,day,fields,json,activity,notify,rows} = require('../services/common');
const {verifyFiles} = require('../services/files');
async function ownProject(user,id) {
 const snap = await db().collection('projects').doc(id).get();
 if (!snap.exists) fail(404,'not-found','Project not found');
 assert(user.role === 'manager' || snap.data().clientId === user.uid,'This project belongs to another client',403);
 return snap;
}
function projectInput(body) {
 fields(body,['title','description','startDate','deadline','priority']);
 const data = {title:text(body.title,'Title',200,true),description:text(body.description === undefined ? '' : body.description,'Description'),startDate:day(body.startDate),deadline:day(body.deadline),priority:body.priority === undefined ? 'medium' : body.priority};
 assert(data.deadline>=data.startDate,'Deadline must be on or after start date');
 assert(['low','medium','high'].includes(data.priority),'Invalid priority'); return data;
}
async function create(req,res) {
 const fs=db(), ref=fs.collection('projects').doc(), input=projectInput(req.body);
 const managers=rows(await fs.collection('users').where('role','==','manager').get());
  const data={...input,clientId:req.user.uid,managerId:null,status:'draft',memberIds:[],totalTasks:0,tasksCompleted:0,progress:0,createdAt:new Date(),updatedAt:new Date()};
 const batch=fs.batch(); batch.set(ref,data);
 activity(batch,req.user,ref.id,'project created','project',ref.id,managers.map(m=>m.id));
 for(const m of managers) notify(batch,m.id,'New project: '+data.title,'system','/manager/projects/'+ref.id);
 await batch.commit(); res.status(201).json(json({id:ref.id,...data}));
}
async function update(req,res) {
 const input=projectInput(req.body); const ref=db().collection('projects').doc(req.params.id);
  await db().runTransaction(async tx=>{
   const snap=await tx.get(ref); if(!snap.exists) fail(404,'not-found','Project not found');
    assert(req.user.role==='manager'||snap.data().clientId===req.user.uid,'This project belongs to another client',403);
    const tasks=rows(await tx.get(db().collection('tasks').where('projectId','==',ref.id)));
    assert(tasks.every(task=>day(task.startDate)>=input.startDate && day(task.deadline)<=input.deadline),'Project dates must include all existing task dates');
    tx.update(ref,{...input,...(req.user.role==='manager' ? {managerId:req.user.uid,status:snap.data().status==='submitted'?'active':snap.data().status} : {}),updatedAt:new Date()});
   activity(tx,req.user,ref.id,'project updated','project',ref.id,[snap.data().clientId,snap.data().managerId].filter(Boolean));
 }); res.json({ok:true});
}
async function requirement(req,res) {
  const ps=await ownProject(req.user,req.params.id);
  const files=req.body.files ? await verifyFiles(req.body.files,req.user,'requirement',ps.id) : [];
  const data={projectId:ps.id,title:text(req.body.title,'Title',200,true),details:text(req.body.details === undefined ? '' : req.body.details,'Details'),fileUrls:files.map(file=>file.url),files,status:'Pending',createdAt:new Date()};
 const ref=db().collection('requirements').doc(),batch=db().batch();batch.set(ref,data);
 activity(batch,req.user,ps.id,'requirement added','requirement',ref.id,[ps.data().clientId,ps.data().managerId].filter(Boolean));
 await batch.commit();res.status(201).json(json({id:ref.id,...data}));
}
async function document(req,res) {
 const ps=await ownProject(req.user,req.params.id);
 const files=await verifyFiles(req.body.files,req.user,'document',ps.id);
 const batch=db().batch();
 for(const file of files) { const ref=ps.ref.collection('documents').doc(); batch.set(ref,{...file,id:ref.id,projectId:ps.id});activity(batch,req.user,ps.id,'document uploaded','document',ref.id,[ps.data().clientId,ps.data().managerId].filter(Boolean)); }
 await batch.commit();res.status(201).json({ok:true});
}
async function feedback(req,res) {
 const ps=await ownProject(req.user,req.params.id);
 const ref=db().collection('feedback').doc();
  const data={projectId:ps.id,projectTitle:ps.data().title,taskTitle:text(req.body.taskTitle === undefined ? 'Project feedback' : req.body.taskTitle,'Task title',200),clientId:req.user.uid,comment:text(req.body.comment,'Feedback',10000,true),status:'Pending',repliesCount:0,createdAt:new Date()};
 const batch=db().batch();batch.set(ref,data);
 notify(batch,ps.data().managerId,'Client feedback: '+ps.data().title,'system','/manager/projects/'+ps.id);
 activity(batch,req.user,ps.id,'feedback added','project',ps.id,[ps.data().managerId].filter(Boolean));
 await batch.commit();res.status(201).json(json({id:ref.id,...data}));
}
module.exports={create,update,requirement,document,feedback,ownProject};
