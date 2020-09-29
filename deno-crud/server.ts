
import { Application,Router } from "https://deno.land/x/oak@v6.0.0/mod.ts";
import {
  viewEngine,
  engineFactory,
    adapterFactory,
} from "https://deno.land/x/view_engine@v1.3.0/mod.ts";
import {Client} from 'https://deno.land/x/postgres/mod.ts'; 
import {databaseCredential} from './config.ts'; 
const client = await new Client(databaseCredential);

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();
import User from "./user.dto.ts";
const app = new Application();

const router = new Router();
router

.post("/savedata", async({ request, response }: { request: any; response: any }) => {
  const body = await request.body({
            contentTypes: {
                text: ["application/json"],
            },
        });
  let msg = '';
	  try{
		await client.connect();
			let user = new User();
			const values = await body.value;
			user.ename = values.ename;
			
			if(values.eid == ''){
				const addData = await client.query("INSERT INTO  emp(ename,emobile,eemail,eaddress) VALUES ('"+values.ename+"','"+values.emobile+"','"+values.eemail+"','"+values.eaddress+"');");
				msg = 'Saved';
			}else{
				const addData = await client.query("UPDATE emp SET ename = '"+values.ename+"',emobile = '"+values.emobile+"' ,eemail ='"+values.eemail+"' ,eaddress = '"+values.eaddress+"' WHERE id = "+values.eid+";");
				msg = 'Updated';
			}
			}catch(err){
		console.log(err);
	}
	console.log(msg);
	await client.end();
  response.body = {
    msg: msg,
    status: "success",
  };
})



	


.post("/setData", async({ request, response }: { request: any; response: any }) => {
  const body = await request.body({
            contentTypes: {
                text: ["application/json"],
            },
        });
  
	  
			const values = await body.value;
			let id = values.id;
			
			const getData = await client.query("SELECT * FROM  emp where id="+id+" order by id desc;");
			const data = new Array();
			getData.rows.map(rowItems => {
				let co:any = new Object();
				getData.rowDescription.columns.map((columnItems,i) =>{
					co[columnItems.name] = rowItems[i];
				});
				data.push(co);
			});
		  response.body = {
		    msg: "fetched",
		    data:data, 
		  };
})

.post("/delData", async({ request, response }: { request: any; response: any }) => {
  const body = await request.body({
            contentTypes: {
                text: ["application/json"],
            },
        });
  
	  
			const values = await body.value;
			let id = values.id;
			await client.connect();
			const deleteData = await client.query("delete from  emp  WHERE id="+id+";");
			
		  response.body = {
		    msg: "Deleted",
		    
		  };
})

.get("/getData", async({ response }: { response: any }) => {
	await client.connect();
	const getData = await client.query("SELECT * FROM  emp order by id desc;");
	const data = new Array();
	getData.rows.map(rowItems => {
		let co:any = new Object();
		getData.rowDescription.columns.map((columnItems,i) =>{
			co[columnItems.name] = rowItems[i];
		});
		data.push(co);
	});
  response.body = {
    message: "hello world",
    data:data, 
  };
});


app.use(router.routes());
app.use(router.allowedMethods());

app.use(viewEngine(oakAdapter, ejsEngine));

app.use(async (ctx, next) => {
  ctx.render("index.ejs", { data: { msg: "Deno CRUD Operation with Postgresql" } });
});

await app.listen({ port: 8000 });

