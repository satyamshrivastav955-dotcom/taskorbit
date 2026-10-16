require('./config/firebase');
const path=require('path');
const express=require('express'),cors=require('cors');
const {HttpError}=require('./services/common');
const app=express();
app.disable('x-powered-by');
const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5175', 'http://127.0.0.1:5175'];
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : devOrigins;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.json({limit:'1mb'}));
app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Cache-Control','no-store');next();});
app.get('/api/health',(req,res)=>res.json({ok:true,service:'taskorbit-backend'}));
app.get('/api/supabase/status',(req,res)=>{const {isSupabaseConfigured}=require('./config/supabase');res.json({ok:true,configured:isSupabaseConfigured()});});
app.get('/api/supabase/connectivity',async(req,res)=>{const {checkSupabaseConnectivity}=require('./config/supabase');const result=await checkSupabaseConnectivity();res.status(result.ok?200:502).json(result);});
app.use('/api',require('./routes/api'));
app.use((req,res)=>res.status(404).json({error:{code:'not-found',message:'Endpoint not found'}}));
app.use((e,req,res,next)=>{
 const known=e instanceof HttpError;
 if(!known) console.error('Request failed:',e.message);
 const status=known?e.status:e.type==='entity.parse.failed'?400:500;
 res.status(status).json({error:{code:known?e.code:'internal',message:known?e.message:status===400?'Invalid JSON request':'Unable to complete this request. Please try again.'}});
});
if(require.main===module) app.listen(process.env.PORT||4000,process.env.HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1'),()=>{
 console.log('TaskOrbit backend listening on '+(process.env.PORT||4000));
 require('./services/deadlines').startDeadlineJob();
});
module.exports=app;
