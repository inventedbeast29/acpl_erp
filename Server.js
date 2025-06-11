const express=require('express');
const serveStatic = require('serve-static');
const path=require('path');
const app=express();
app.use(express.static(path.join(__dirname)));
const nodemailer=require('nodemailer')
const mysql=require('mysql2');
const { createConnection } = require('net');
const { Console, error } = require('console');
const bcrypt=require("bcrypt");
const jwt =require("jsonwebtoken");
const cookieparser=require("cookie-parser");
app.use(cookieparser());
const authenticateRoutes=require("./authenticateRoutes")
const methodoverride=require('method-override');
const { default: Swal } = require('sweetalert2');
const roleCheck=require("./RBAC");
const { queryObjects } = require('v8');




// Set EJS as view engine]
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // If needed

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(methodoverride('_method'));

app.get("/",(req,res)=>{
    res.render("signup");
})



// Use your real email and app password here
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kishanrai18739@gmail.com',
    pass: 'rzko ryfw pzmz uzac' // NOT your regular Gmail password
  }
});


const db=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"Kishan@123",
  database:"ERP"
})
db.connect((err)=>{
  if(err)  {console.log("Error connecting to database",err)}
  else{
    console.log("Connected to database Successfully")
  }
})


app.post("/",(req,res)=>{
const data=req.body;
const{name,email,password,phone}=data
console.log("data from frontend is",data);
    

//Connecting DB to store Registered Users

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        // Store hash in your password DB.
     //
     //    console.log("Hashed Password is",hash)

const sql="INSERT INTO users (name,email,password,phone)VALUES(?,?,?,?)"
 db.query(sql,[name,email,hash,phone],(err,result)=>{
     if(err){
      console.log("Error querying to DB",err)
      return res.send("Duplicate Email,Go back and enter new mail")
      }
     else{
         console.log("Query Successfull");
       //res.render("signup",{error:'success'})
    
async function main() {
  // send mail with defined transport object
  
  const info = await transporter.sendMail({
    from: '"SWAYAM" <kishanrai18739@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Login Details✔", // Subject line
  text: `Hi ${name},\n\nThanks for registering!\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n \nRole:Admin \n\nPlease keep this safe.`  
})
console.log("Message sent to",email);
}
main()

    //Sending role information to login page and rendering
    const query2="Select distinct role from users";
    db.query(query2,(err,urole)=>{
      if(err){
        console.log(err)
        return res.status(500)
      }
     // console.log(urole)
      res.render("login",{urole})
      })
   
  }})})})})




app.get("/login",(req,res)=>{
  const query="select distinct role from users";
  db.query(query,(err,urole)=>{
    if(err){
      console.log("error",err)
    }
      res.render("login",{urole})
  })
})

app.post("/login",(req, res) => {
  const { email, password } = req.body;
  const query1 = "SELECT * FROM users WHERE email = ?";
  
  db.query(query1, [email], async (err, result) => {
    if (err) {
      console.log("Error fetching from DB", err);
      return res.status(500).send("Server Error");
    }

    if (result.length === 0) {
      return res.status(400).send("Invalid Credentials");
    }
      const inputrole=req.body.role

       const user = result[0];

      if(user.role!==inputrole || inputrole===0){
          return res.send("Invalid Credentials");
      }
      else{

    bcrypt.compare(password, user.password, (err, isPassMatch) => {
      if (err) {
        console.log("Error comparing passwords", err);
        return res.status(500).send("Server Error");
      }

      if (!isPassMatch) {
        return res.status(400).send("Invalid Credentials");
      }

      // Generate token
      const token = jwt.sign({ email,role:user.role}, "Secret");

      // Set the cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // Render the main page

      res.redirect("/main"); // you can pass user data to your template if needed
        });
      }
  })
  });

    app.use(authenticateRoutes) //Authentication of users to access the routes

app.get("/main",(req,res)=>{
const query="Select COUNT(*) As total_user from users";
const query2="select Count(*) AS total_customer from customers"
const query3="Select Count(*) as total_purchase_req from purchase_query" 
db.query(query,(err,result)=>{
  if(err){console.log(err)}
  //console.log(result[0].total_user);
  const users=result[0]
  db.query(query2,(err,result2)=>{
    if(err){console.log(err)}
    //console.log(result2);
    const customers=result2[0];
    db.query(query3,(err,result3)=>{
      if(err){console.log(err)};
    //  console.log(result3[0].total_purchase_req)
      const total_purchase=result3[0].total_purchase_req;
   res.render("main",{users,customers,total_purchase});

    })
  })
})
})


    
app.get("/employee",(req, res) => {
  const query="Select * from users"
  db.query(query, (err, users) => {
    if (err) {
      console.log("error fetching users", err);
      return res.status(500).json({ error: "No users found" })}
        //console.log(users)
     res.render("employee",{users});
    
    })})
  


// app.get("/employee",(req, res) => {
//   res.redirect("/employee"); // No users passed — table will be filled by JS
// });


app.post("/logout",(req,res)=>{
  res.clearCookie("token")

//To pass the role data from db to frontend role dropdown menu
  const query = "SELECT DISTINCT role FROM users";
  db.query(query, [], (err, urole) => {
    if (err) {
      console.error("Error fetching roles on logout:", err);
      return res.send("Error loading login page");
    }

    // Render login page with the roles data
    res.render("login", { urole });
  })

})

app.get("/adduser",(req,res)=>{
  res.render("userform");
})

//Deleteing user using post method since forms doesnt support delete method

app.post("/deleteuser/:id", (req, res) => {
  const query = "DELETE FROM users WHERE id=?";
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.log("Unable to delete user", err);
      return res.status(500).send("Unable to delete user");
    }
    
    // After deletion, redirect back to the same page
    res.redirect("/employee");  // Redirecting to the employee list page
  });
});



app.post("/adduser",(req,res)=>{
  const{name,email,phone,password,role}=req.body
  
bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash(password, salt, function(err, hash) {
      // Store hash in your password DB.
      console.log("Hashed Password is",hash)


  const query="Insert INTO users(name,email,phone,password,role)VALUES(?,?,?,?,?)"
db.query(query,[name,email,phone,hash,role],async(err,result)=>{
if(err){
  console.log("Unable to add Employee",err)
  res.send("Unable to add employee")
}
if(result){
  const{name,email,password,role}=req.body
  
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"User Management Tool" <kishanrai18739@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Login Details✔", // Subject line
    text: `Greetings,\n\nNew User has been added  ${name} !\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\nRole:${role} \n\n Please keep this safe.`  
})
//  console.log("Employee added")
 // console.log(result)
  
  res.redirect("/employee");
}
})})})})


app.get("/updateuser/:id",(req,res)=>{
      const id=req.params.id;
      const query="Select * from users where id=?"
      db.query(query,[id],(err,users)=>{
        if(err){console.log(err);return res.send("Error fetching user details")}
       // console.log(users)
        res.render("updateuser",{users})
      })   
})

app.post("/updateuser/:id",(req,res)=>{
  const id=req.params.id
//  console.log("id",id);
  const password2=req.body.password
 //   console.log(password2)
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password2, salt, function(err, hash) {
      if(err){console.log("Cannot Hash")}
      const query=" update users set password=? where id=?"
  db.query(query,[hash,id],(err,result)=>{
    if(err){  
      console.log(err);return res.send("Cannot Update Password")
          }
         // console.log("Password updated succesfully")
        res.redirect("/employee")
    });
}); 
  })
})


//...........CUSTOMER FIELD AND UI STARTS HERE.............



// To show employyes in customer dropdown

app.get("/add-customer",(req,res)=>{
  const query="Select * from users"
  db.query(query,(err,employees)=>{
    if(err){console.log("Unable to query users")
    }
  res.render("add-customer",{employees})
  })
})

app.get("/customer_dashboard",(req,res)=>{
  res.render("customer_dashboard");
})


app.post("/add-customer",(req,res)=>{
  const userInfo=req.user.email
  const {name,phone,email,address,pan,aadhar,assigned,agentregion,manufacturer,manu_person_name,mancontact,mancountry,contactperson}=req.body
  const query="Insert into customers(name,phone,email,address,pan,aadhar,assigned,created_by,updated_by,last_updated,contact_person,agent_region,manufacturer_name,manuf_person_name,manuf_contact,manuf_country) values(?,?,?,?,?,?,?,?,?,Now(),?,?,?,?,?,?)";
  db.query(query,[name,phone,email,address,pan,aadhar,assigned,userInfo,userInfo,contactperson,agentregion,manufacturer,manu_person_name,mancontact,mancountry],(err,result)=>{
      if(err){
        console.log("Cannot Insert data into Customers",err)
      }
      if(result){
        
        res.redirect("/customer_dashboard")
      }
  })
})


app.get("/api/customer_dashboard",(req,res)=>{
  
  const query="select * from customers"
  db.query(query,(err,customer)=>{
    
    if(err){
      console.log("Unable to query customers",err)
    }

 res.json(customer)
})})


app.get("/customers/edit/:id",(req,res)=>{
  const id=req.params.id
  const query="Select*from customers where id=?";
  db.query(query,[id],(err,result)=>{
    if(err){return res.send("error")}
    let customer=result[0];
    res.render("update_customer",{customer})
  })

})
app.post("/customers/update/:id",(req,res)=>{
  const userInfo=req.user.email;
  const id=req.params.id
  const {phone,email,address,pan,aadhar}=req.body;
  const query=  "UPDATE customers   SET  phone = ?, email = ?, address = ?, pan = ?, aadhar = ?, updated_by = ?, last_updated = NOW()  WHERE id = ?"
  db.query(query,[phone,email,address,pan,aadhar,userInfo,id],(err,result)=>{
    if(err){return res.send("cannot update customer",err)}
    res.redirect("/customer_dashboard")
  })
})

app.post("/customers_del/:id",(req,res)=>{
  const query="Delete  from customers where id=?"
  db.query(query,[req.params.id],(err,result)=>{
    if(err){console.log("Unable to delete customers",err)
      return res.send("Customer cannot be deleted");
    }
    res.redirect("/customer_dashboard")
  })
})

app.get("/view/customer/:cust_id",(req,res)=>{
  const id=req.params.cust_id;
  const query="Select * from customers where id=?";
  db.query(query,[id],(err,result)=>{
      if(err){return res.send("Unable to view"),err}
      let customer=result[0];
    //  console.log(customer)
      res.render("view_customer",{customer})
  })
})

//PURCHASE REQUEST DETAILS TO BE ADDED.


app.get("/purchase_query",(req,res)=>{
  
  const query1="Select * from customers";
  const query2="select * from users";
  const query3="select distinct application_type from license_type"
  const query4="select distinct form_name from license_type"
  const query5="Select * from govt_department"
  db.query(query1,(err,customer)=>{
    if(err){
      return res.send("Error",err)
    }
  
  db.query(query2,(err,employee)=>{
    if(err){
      console.log(err);
    }
    db.query(query3,(err,apptype)=>{
      if(err){
        console.log(err);
      }
      db.query(query4,(err,formname)=>{
        if(err){console.log(err)}
        db.query(query5,(err,govt)=>{
          if(err){console.log(err)}
            res.render("purchase_details",{customer,employee,apptype,formname,govt})
        })
      
  })})})})
})

app.post("/purchase_license_details",(req,res)=>{
  const {license}=req.body
  const query="select application_details from license_type where form_name=?"
  db.query(query,[license],(err,result)=>{
      if(err){console.log(err); return res.send("cannot get license detail")}
    //  console.log("License detail is",result[0].application_details)
      res.json({status:"success",lic_detail:result[0].application_details})
  })
})


app.post("/query_serial", (req, res) => {
  const { prefix } = req.body;
  const query = `
    SELECT serial_no FROM purchase_query 
    WHERE serial_no LIKE ? 
    ORDER BY serial_no DESC 
    LIMIT 1`;
  
  db.query(query, [`${prefix}%`], (err, rows) => {
    if (err) {
      console.log("Error generating serial:", err);
      return res.status(500).json({ status: "error", message: "Server error" });
    }

    let nextNumber = 1;
    if (rows.length > 0) {
      const lastSerial = rows[0].serial_no;
      const numberPart = parseInt(lastSerial.replace(prefix, ""), 10);
      nextNumber = numberPart + 1;
    }

    const serial_no = `${prefix}${String(nextNumber).padStart(2, "0")}`;
    res.json({ status: "success", serial_no });
  });
});


app.post("/purchase_query",(req,res)=>{
  const userInfo=req.user.email;
const {customername,worktype,subwork,license_detail,govt_branch,remarks,querydate,assignedto,query_sts,queryclose_date,serial_no}=req.body;

  const query="Insert into purchase_query(customer_name,work_type,sub_work,item_detail,govt_branch,remarks,query_date,assigned_to,query_sts,queryclose_date,updated_by,last_updated,serial_no)values(?,?,?,?,?,?,?,?,?,?,?,Now(),?)"
  db.query(query,[customername,worktype,subwork,license_detail,govt_branch,remarks,querydate,assignedto,query_sts,queryclose_date,userInfo,serial_no],(err,pquery)=>{
    if(err){
      console.log("Unable to create Purchase",err)
      return res.send("Unable to create purchase");
    }
    res.redirect("/purchase_dashboard")
  })})



  app.get("/purchase_dashboard",(req,res)=>{
    const query="Select * from purchase_query"
    db.query(query,(err,pquery)=>{
      if(err){
        return res.send("Error")
      }
      res.render("purchase_dashboard",{pquery})})
    })
  

    app.get("/purchase/edit/:query_id",(req,res)=>{
      const id=req.params.query_id;
      const query="select * from purchase_query where id=?";
      db.query(query,[id],(err,result)=>{
        if(err){return res.send("Error")}
      let pquery=result[0];
  //    console.log(pquery)
        res.render("purchase_edit",{pquery})
      })
    
    })
  app.post("/purchase_query/update/:query_id",(req,res)=>{
    const userInfo=req.user.email
      const id=req.params.query_id;
      const{query_sts,remarks}=req.body
      const query="UPDATE purchase_query set query_sts=?,remarks=?,updated_by=?,last_updated=Now() where id=? "
      db.query(query,[query_sts,remarks,userInfo,id],(err,result)=>{
        if(err){
          return res.send("Error editing purchase query".err)
        }
        res.redirect("/purchase_dashboard")
      })
  })

app.post("/purchase/delete/:id",(req,res)=>{
  const query="Delete from purchase_query where id=?";
  db.query(query,[req.params.id],(err,result)=>{
    if(err){
      console.log("Error deleting purchase query");
      return res.send("Unable to delete puchase query",err)
    }
    res.redirect("/purchase_dashboard")
  })
})

app.get("/view/purchase/:query_id",(req,res)=>{
  const id=req.params.query_id
  const query="select * from purchase_query where id=? "
  db.query(query,[id],(err,qresult)=>{
    if(err){return res.send("Cannot view Purchase query",err)}
    let result=qresult[0];
    console.log(result)
res.render("purchase_view",{result})
  })
})




//Add License Type details
app.get("/add_license",(req,res)=>{
  res.render("add_license")
})
app.post("/license",(req,res)=>{
  const query="Insert into license_type (application_type,form_name,application_details)values(?,?,?)"
  const{application_type,form_name,application_details}=req.body
  db.query(query,[application_type,form_name,application_details],(err,result)=>{
    if(err){
      console.log("Unable to insert into license table",err);
      return res.send("unable to add license")
    }
    res.redirect("/applicationtype_dashboard")
  })
})


app.get("/applicationtype_dashboard",(req,res)=>{
  const query="select * from license_type"
  db.query(query,(err,form)=>{
    if(err){console.log(err)
      return res.send("errro");
    }
  

app.post("/license_delete/:id",(req,res)=>{
  const {id}=req.params;
  const query="Delete from license_type where id=?"
  db.query(query,[id],(err,result)=>{
    if(err){
      return res.send("Unable to delete item",err)
    }
    res.redirect("/applicationtype_dashboard")
  })
})



  res.render("applicationtype_dashboard",{form:form})
  })
})

  //Quotation Module 
  
app.get("/add_quotation",(req,res)=>{
  const query="Select distinct name from customers"
  db.query(query,(err,customers)=>{
    if(err){
      console.log(err)
    }
  const query1="Select distinct form_name from license_type";
  db.query(query1,(err,form_name)=>{
    if(err){console.log(err)}
  
    const query2="select serial_no from purchase_query"
    db.query(query2,(err,serial_no)=>{
      if(err){console.log(err)}
      
  //    console.log(serial_no)
      res.render("add_quotation",{customers,form_name,serial_no})
    })
})
})
})


app.post("/submit_quotation",(req,res)=>{
  let userInfo=req.user.email
  const {customerName,gst,quotation_sts,quotationNo,totalTax,totalDiscamt,totalQty,grandTotal,paymentTerms,termsConditions,govtfee,constfee,remarks,refno}=req.body
 
 //console.log(customerName,quotationDate,quotationNo,totalQty,grandTotal,"Paymentterm",paymentTerms,"termsConditions",termsConditions,"remark",remarks);
    const query="Insert into quotation (cust_name,gst,qtn_date,quotation_no,total_qty,totalTax,total_disc,total_amt,quotation_sts,govtfee,const_fee,created_by,p_query_ref_no)values(?,?,Now(),?,?,?,?,?,?,?,?,?,?) "
    const query2 = "INSERT INTO quotation_items (quotation_no, item_desc, quantity, unit_price, discount_amt, tax_amt, total_amt,payment_term,term_condition,notes) VALUES (?, ?, ?, ?, ?, ?,?,?,?, ?)";
   const   {item_desc,quantity,unitPrice,discount,tax,amount}=req.body
  // console.log(item_desc,quantity,unitPrice,discount,tax,amount)
    
    db.query(query,[customerName,gst,quotationNo,totalQty,totalTax,totalDiscamt,grandTotal,quotation_sts,govtfee,constfee,userInfo,refno],(err,result)=>{
      if(err){
        console.log("error inserting quotation details",err)
      }
      else{
        console.log("Quotation added successfully")
        const totalItems = item_desc.length;
        let insertedCount = 0;
         for (let i=0;i<totalItems;i++){
          const desc=item_desc[i];
          const qty=quantity[i];
          const price=unitPrice[i];
          const disc=discount[i];
          const taxAmt=tax[i];
          const amt=amount[i];
        //  console.log(`Inserting Items ${i+1}`,{desc, qty, price, disc, taxAmt, amt })
            db.query(query2,[quotationNo,desc,qty,price,disc,taxAmt,amt,paymentTerms,termsConditions,remarks],(err,result)=>{
              if(err){
                console.log("error",err);
                return res.send("Error inserting items")
              }
              insertedCount++;

              // Only redirect after all items are inserted
              if (insertedCount === totalItems) {
                res.redirect("/quotation_dashboard");
              }
            })
         }  
      }})
        })



app.get("/quotation_dashboard",(req,res)=>{
// const query="select * from quotation";
    const query2="SELECT quotation.id, quotation.quotation_no, quotation.cust_name,quotation.total_qty,quotation.total_amt,quotation.qtn_date,quotation.quotation_sts,quotation.acc_rej_date,quotation.last_updated,quotation.updated_by,quotation.created_by,quotation.sent_date,quotation.p_query_ref_no, sales_invoice.invoice_no FROM quotation LEFT JOIN sales_invoice ON quotation.quotation_no = sales_invoice.quotation_no";
    db.query(query2,(err,result)=>{
      if(err){console.log(err)}
  //    console.log(result)

      res.render("quotation_dashboard",{result});
    })
    })



app.get("/view-quotation/:id",(req,res)=>{
  const id=req.params.id;
  const qNo=req.query.qno
  const query="Select * from quotation where id=?"
 const query2="select * from quotation_items where quotation_no=?"
  db.query(query,[id],(err,result)=>{
    if(err){console.log(err); return res.send("Cannot view quotation")}
    const qresult=result[0];
   // console.log(result);
   
    db.query(query2,[qNo],(err,q2result)=>{
      if(err){return res.send("error",err)}
  
        res.render("quotation_view",{qresult,q2result})
      })
  })
})

app.get("/edit-quotation/:id",(req,res)=>{
  const id=req.params.id;
  const qNo2=req.query.qno
  const query="Select * from quotation where id=?"
 const query2="select * from quotation_items where quotation_no=?"

  db.query(query,[id],(err,result)=>{
    if(err){return res.send("Cannot view quotation",err)}
    const qresult=result[0];
   // console.log("Edit query",qresult);
   
    db.query(query2,[qNo2],(err,q2ans)=>{
      if(err){return res.send("error",err)}
      
          res.render("edit_quotation",{q2ans,qresult})
        })
})
  })

  app.post("/edit_quotation",(req,res)=>{
    const {quotation_sts,acc_rej_date,paymentTerms,termsConditions,remarks,qtnsent_date}=req.body
    
    const qNo=req.query.qno
    const query="Update quotation set quotation_sts=?,acc_rej_date=?,last_updated=Now(),sent_date=? where quotation_no=?"
    const query2="Update quotation_items set payment_term=?,term_condition=?,notes=? where quotation_no=?"
    db.query(query,[quotation_sts,acc_rej_date,qtnsent_date,qNo],(err,result)=>{
      if(err){
        console.log(err);
         return res.send("Error Updating Quotation")}

        db.query(query2,[paymentTerms,termsConditions,remarks,qNo],(err,result)=>{
            if(err){
              console.log(err);
              return res.send("Cannot Update Quotation")}
            res.redirect("/quotation_dashboard")
      })
      
    })
  })
  

app.post("/delete-quotation/:id",(req,res)=>{
  const query="Delete from quotation where id=?"
  const{id}=req.params
//  console.log(id);
  db.query(query,[id],(err,result)=>{
      if(err){
        console.log("Error deleting quotaiton",err);
        return res.send("Cannot delete quotation")
      }
      res.redirect("/quotation_dashboard")
  })
})



  app.get("/add_sales_invoice/:qno",(req,res)=>{
    const qtn=req.params.qno;
    const customer=req.query.customer_name;
    const query="select * from quotation where quotation_no=?";
    const query2="select * from customers where name=?"
    const query3="Select * from quotation_items where quotation_no=?"
    db.query(query,[qtn],(err,result)=>{
      if(err){console.log(err)}
      const queryres=result[0]
     db.query(query2,[customer],(err,cust)=>{
      if(err){console.log(err)}
      const result2=cust[0];
      db.query(query3,[qtn],(err,items)=>{
        if(err){console.log(err)}
        res.render("add_invoice",{queryres,result2,items})
      })    
     })  
    })
  })


app.post("/submit/sales-invoice",(req,res)=>{
  const{invoice_number,quotation_no,customer_name,customer_phone,customer_address,total_amount,remarks,payment_terms,terms_condition}=req.body
  const query="Insert into sales_invoice (invoice_no,quotation_no,cust_name,cust_contact,cust_add,total_amt,notes,payment_terms,term_condition,created_at) values(?,?,?,?,?,?,?,?,?,Now())"
  db.query(query,[invoice_number,quotation_no,customer_name,customer_phone,customer_address,total_amount,remarks,payment_terms,terms_condition],(err,result)=>{
    if(err){console.log("Cannot insert into sales_inovice",err); return res.send("Invoice cannot be created")}
    res.redirect("/sales_dashboard")
  })
})

app.get("/sales_dashboard",(req,res)=>{
  const query="Select * from sales_invoice";
  db.query(query,(err,result)=>{
    if(err){console.log("cannot fetch data from sales_invoice table",err);return res.send("Cannot fetch data")}
   // console.log("sales",result)
        res.render("sales_dashboard",{result})
  })
   })

///----Payment Module Starts------

app.get("/payment",(req,res)=>{

  const query="Select * from payments"
  const query2=`  SELECT 
      p.sales_invoice,
      s.cust_name,
      MAX(s.total_amt) AS invoice_amt,
      SUM(p.amt_paid) AS total_paid,
      MAX(s.total_amt) - SUM(p.amt_paid) AS balance_due,
      MAX(p.payment_date) AS last_payment_date
    FROM payments p
    JOIN sales_invoice s ON s.invoice_no = p.sales_invoice
    GROUP BY p.sales_invoice;
  `;
  db.query(query,(err,result)=>{
    if(err){console.log("Cannot Get payments")}
    db.query(query2,(err,balance)=>{
      if(err){console.log(err)}
      //console.log("Balance",balance)
        res.render("payment_dashboard",{result,balance})
      })         
      })
    })


app.get("/record_payment/:id",(req,res)=>{
  const {id}=req.params;
//  console.log(id)
  const query="select * from sales_invoice where invoice_no=?"
  db.query(query,[id],(err,inv)=>{
    if(err){console.log(err);return res.send("cannot record payment")}
    const result=inv[0]
      res.render("add_payment",{result})
  })
  })



app.post("/add_payments",(req,res)=>{
   const{paymentId,invoiceNumber,customerId,currency,paymentMethod,paymentDate,invoiceAmount,amountPaid,transaction_id,cheque_no,paymentNotes}=req.body;
     const amountPaidNum = Number(amountPaid);

  // 1. First fetch the correct invoice amount from DB
  const invoiceQuery = "SELECT total_amt FROM sales_invoice WHERE invoice_no = ?";
  db.query(invoiceQuery, [invoiceNumber], (err1, invoiceResult) => {
    if (err1) {
      console.log(err1);
      return res.send("❌ Error fetching invoice amount");
    }

    if (invoiceResult.length === 0) {
      return res.send("❌ Invoice not found");
    }

    const invoiceAmount = Number(invoiceResult[0].total_amt);

    // 2. Then get total already paid
    const checkQuery = `
      SELECT COALESCE(SUM(amt_paid), 0) AS total_paid
      FROM payments 
      WHERE sales_invoice = ?
    `;

    db.query(checkQuery, [invoiceNumber], (err2, paymentResult) => {
      if (err2) {
        console.log(err2);
        return res.send(" Error checking existing payments");
      }

      const alreadyPaid = Number(paymentResult[0].total_paid);
      const newTotalPaid = alreadyPaid + amountPaidNum;

      if (newTotalPaid > invoiceAmount) {
        return res.json({pstatus:"Exceeds"})
      }

  const query="Insert into payments (payment_id,sales_invoice,cust_name,currency,method,payment_date,invoice_amt,amt_paid,transaction_no,cheque_no,notes) values(?,?,?,?,?,?,?,?,?,?,?)"
    db.query(query,[paymentId,invoiceNumber,customerId,currency,paymentMethod,paymentDate,invoiceAmount,amountPaid,transaction_id,cheque_no,paymentNotes],(err,result)=>{
      if(err){console.log(err);return res.send("Cannot register payment")}
      res.json({pstatus:"Success"})
    })
})
})})

app.get("/view_paymenthistory/:invoice",(req,res)=>{
  const {invoice} =req.params
   const query="select * from payments where sales_invoice=?"
   db.query(query,[invoice],(err,result)=>{
    if(err){console.log(err)}
    console.log("history",result)
    res.render("viewpaymenthistory",{result})
   })
})

//`````````````````````````Govt Department````````````````````````````````
app.get("/govt-department",(req,res)=>{
  const query="Select * from govt_department"
  db.query(query,(err,result)=>{
    if(err){console.log(err)}
    res.render("govt-dep-dashboard",{result})
  })
})

app.get("/add-department",(req,res)=>{
  res.render("add_department")
})
app.post("/submit-department",(req,res)=>{
  const{departmentname,note}=req.body;
  const query="Insert into govt_department (dept_name,note) values(?,?)"
  db.query(query,[departmentname,note],(err,result)=>{
    if(err){console.log(err);return res.send("Cannot Create Department")}
    res.redirect("/govt-department")
  })
})

app.post("/delete_department/:id",(req,res)=>{
  const {id}=req.params
  const query="Delete from govt_department where id=?"
  db.query(query,[id],(err,result)=>{
    if(err){console.log(err);return res.send("Cannot Delete Department")}
    res.redirect("/govt-department")
  })
})

        //````````````Reminders`````````````````````````````````

app.get("/reminders",(req,res)=>{
  
  const query="select distinct cust_name,cust_mail from reminder"
  db.query(query,(err,data)=>{
    if(err){console.log(err)}
      res.render("reminder_dashboard",{data})
    })          
    }) 
 
    app.get("/view_reminder_history/:name",(req,res)=>{
      const {name}=req.params
      const query="Select * from reminder where cust_name=?"
      const query2="SELECT COUNT(sent_date) AS total_reminders FROM reminder WHERE cust_name = ?"
      db.query(query,[name],(err,result)=>{
        if(err){console.log(err)}
      //  console.log(result)
      db.query(query2,[name],(err,count)=>{
        if(err){console.log(err)}
        let totalcount=count[0]
        //console.log(totalcount)
        res.render("viewreminder_history",{result,totalcount})
      })
        
      })
      
    })

    app.get("/send_reminder",(req,res)=>{
        const query="Select * from customers";
  const query2="Select * from quotation";
  db.query(query,(err,result)=>{
    if(err){
      console.log(err)
    }
    db.query(query2,(err,quotation)=>{
      if(err){console.log(err);
        return res.send("Cannot get quotation")}
      res.render("reminder",{result,quotation})
    })
  })
})
 

  app.post("/send_reminder",(req,res)=>{
    const{customerName,customerEmail,quotationNo,reminderType,message}=req.body
    const query="Insert into reminder (cust_name,cust_mail,reminder_type,sent_date,message) values (?,?,?,Now(),?)"
    db.query(query,[customerName,customerEmail,reminderType,message],(err,result)=>{
          if(err){console.log(err)}
    
    console.log(customerName,customerEmail,quotationNo,reminderType,message);
    let subject="";
    if(reminderType==="quotation"){
      subject=`Reminder: Quotation Acceptance for ${quotationNo}`
    }
    else if(reminderType==="payment"){
      subject=`Reminder:Payment Due for ${quotationNo}`
    }
    else if(reminderType==="document"){
      subject=`Reminder:Documents Submission Pending`
    }
    else if(reminderType===`queryclosure`){
      subject=`Reminder:Query Closure`
    }

   const mailOptions={
        from: "SY Associates",
        to: customerEmail,
        subject: subject,
        html:` Dear <b>${customerName}</b>,<br><br>${message}<br><br>Regards,<br>SY Associates`
      }

      transporter.sendMail(mailOptions,(err,result)=>{
        if (err) {
          console.log('Error sending email: ', err.toString);
          return res.status(500).send('Error sending email');
        }
          res.json({"status":"mailsent"})
  })
})
  })

app.get("/govt-process",(req,res)=>{
   const query="select serial_no from purchase_query";
    const query2="Select name from users"
    db.query(query,(err,result)=>{
      if(err){console.log(err)}
      db.query(query2,(err,emp)=>{
        if(err){console.log(err)}
        res.render("add_govt_process",{result,emp})
})
    })
  })

  app.post("/details",(req,res)=>{
    const {refnovalue}=req.body;
    const query="Select * from purchase_query where serial_no=?"
    db.query(query,[refnovalue],(err,result)=>{
      if(err){console.log(err)}
      const result2=result[0]
      res.json({result2})
    })
  })

  app.post("/submit_govt_process",(req,res)=>{
    const received_from_govt_date2=req.body.received_from_govt_date||null;
    const expiry_date2=req.body.expiry_date||null;
   const application_submission_date2= req.body.application_submission_date && req.body.application_submission_date!="0000-00-00"?req.body.application_submission_date:null
   const sent_to_customer2= req.body.sent_to_customer && req.body.sent_to_customer != '0000-00-00'?req.body.sent_to_customer:null

    const {refno,cust_name,licence,govt_branch,customer_documents,documentdetails,submitted_by_employee,license_no,license_note,status}=req.body
      const query="Insert into govt_process (ref_no,cust_name,license_name,concerned_dept,customer_doc_sent,doc_details,submitted_to_gov,submitted_by,license_rec_date,license_no,license_details,license_expiry,sent_to_customer,sts)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        db.query(query,[refno,cust_name,licence,govt_branch,customer_documents,documentdetails,application_submission_date2,submitted_by_employee,received_from_govt_date2,license_no,license_note,expiry_date2,sent_to_customer2,status],(err,result)=>{
          if(err){console.log(err) ;return}
          res.redirect("/govt_process_dashboard")
        })
  
    })

    app.get("/govt_process_dashboard",(req,res)=>{
      const query="Select * from govt_process"
      db.query(query,(err,result)=>{
        if(err){console.log(err); return res.send("error")}
        //console.log(result)
        res.render("govt_process_dashboard",{result})
      })
    })


    app.get("/govt-process-edit/:id",(req,res)=>{
      const {id}=req.params;
      const {ref}=req.query;
  
      const query="Select * from govt_process where id=?";
      const query2="Select * from govt_process_queries where ref_no=?"
        db.query(query,[id],(err,result)=>{
          if(err){console.log(err);return res.json(err)}
          const result2=result[0]
        // console.log("govtprocess",result2)
          db.query(query2,[ref],(err,govt_query)=>{
            if(err){console.log(err);return res.send("error")}
          //  console.log("govt-query",govt_query)
            res.render("edit_govt_process",{result2,govt_query})
          })
        })
    })



app.post("/edit_govt_process/:refno", (req, res) => {
  const { refno } = req.params;
  const queries = req.body.queries;
  const{license_no,license_note}=req.body
  const received_from_govt_date2=req.body.received_from_govt_date||null
  const expiry_date2=req.body.expiry_date||null
  const sent_to_customer2=req.body.sent_to_customer||null

     const status=sent_to_customer2?"Completed":"Pending";

    // Step 2: Insert new queries from the form
    if (queries && Array.isArray(queries)) {
      const insertQuery = `
        INSERT INTO govt_process_queries 
        (ref_no, query_detail, query_raised_date, query_replied_date, doc_resubmitted_date)
        VALUES (?, ?, ?, ?, ?)
      `;

      queries.forEach((query) => {
        const detail = query.detail || null;
        const raisedDate = query.raised_date || null;
        const repliedDate = query.replied_date || null;
        const resubmittedDate = query.resubmitted_date || null;

        db.query(
          insertQuery,
          [refno, detail, raisedDate, repliedDate, resubmittedDate],
          (insertErr) => {
            if (insertErr) {
              console.error("Error inserting query:", insertErr);
              // Not returning here so other queries can still be inserted
            }
          }
        );
      });
    }
    const query2="Update govt_process set license_rec_date=?,license_no=?,license_details=?,license_expiry=?,sent_to_customer=?,sts=? where ref_no=?"
      db.query(query2,[received_from_govt_date2,license_no,license_note,expiry_date2,sent_to_customer2,status,refno],(err,isnert)=>{
          if(err){console.log(err);return res.send("error")}
          res.redirect("/govt_process_dashboard");

        })
  });



app.post("/replied_date/:id",(req,res)=>{
  const {id}=req.params;
  const {replied_date}=req.body
  const query="Update govt_process_queries set query_replied_date=? where id=?"
  db.query(query,[replied_date,id],(err,result)=>{
    if(err){console.log(err);return res.send("error")}
          res.json({status:"success"})
  })
})


app.get("/govt-process-view/:id",(req,res)=>{
  const {id}=req.params;
  const refno=req.query.ref;
  const query="Select * from govt_process where id=?" 
  const query2="Select * from govt_process_queries where ref_no=?"
  db.query(query,[id],(err,response)=>{
    if(err){console.log(err);return res.send("Cannot get govt_process")};
    //console.log(response[0])
    const result1=response[0];
   db.query(query2,[refno],(err,result2)=>{
    if(err){console.log(err); return res.send("cannot get govtqueries")}
         // console.log(result2)
       res.render("view_govt_process",{result1,result2})
   })
  })
})

app.get("/reports",(req,res)=>{
  const query=`Select distinct submitted_by from govt_process `;
  db.query(query,(err,employees)=>{
    if(err){console.log(err)}
  // console.log(employees)
    res.render("employee_report",{employees})
  })
})


app.post("/getPending",(req,res)=>{
  const {name}=req.body;
  const status="Pending"|| null;
  const query="Select count(*) as pending from govt_process where submitted_by=? and sts=?"
  const query2="Select count(*) as completed from govt_process where submitted_by=? and sts='Completed'"
  const query3="Select Count(*) as total from govt_process where submitted_by=?"
  db.query(query,[name,status],(err,pendingcount)=>{
    if(err){console.log(err)};
    //console.log(pendingcount[0]);
    db.query(query2,[name],(err,completedcount)=>{
      if(err){console.log(err)}
     //   console.log(completedcount[0])
        db.query(query3,[name],(err,total)=>{
          if(err){console.log(err)}
      //    console.log(total[0])
           res.json({'pendingcount':pendingcount[0].pending,'completedcount':completedcount[0],'totalcount':total[0]})
        })
  })
})
})
app.get("/employee/applications/:name", (req, res) => {
  const { name } = req.params;
  const query = "SELECT * FROM govt_process WHERE submitted_by=?";

  db.query(query, [name], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB Error");
    }

    const today = new Date();

    // Generate age buckets
    const processedResults = result.map(row => {
      let ageBuckets = {
        moreThan15: '',
        day15to30: '',
        day31to45: '',
        day46to60: '',
        moreThan60: ''
      };

      if (row.sts !== "Completed" && row.submitted_to_gov) {
        const submittedDate = new Date(row.submitted_to_gov);
        const days = Math.floor((today - submittedDate) / (1000 * 60 * 60 * 24));

        if (days <= 15) ageBuckets.moreThan15 = 1;
        else if (days <= 30) ageBuckets.day15to30 = 1;
        else if (days <= 45) ageBuckets.day31to45 = 1;
        else if (days <= 60) ageBuckets.day46to60 = 1;
        else ageBuckets.moreThan60 = 1;
      }

      return { ref_no: row.ref_no, ...ageBuckets };
    });

    // Merge age buckets back into result
    const mergedResult = result.map(row => {
      const bucketData = processedResults.find(p => p.ref_no === row.ref_no);
      return { ...row, ...bucketData };
    });

    res.render("age_wise_report", { result: mergedResult, name });
  });
});




app.listen(4444,(err)=>{
if(err){console.log(err.message,"Unable to start server")}
else{
    console.log("Server started at Port 4444")
}
})