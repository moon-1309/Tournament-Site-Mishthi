var express = require("express");
var fileUploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;
var mysql2 = require("mysql2");

var app = express();
app.use(fileUploader());

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDq2oWX7mKzEKJGmCFBZ2CIN-cvrErWEBI");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.listen(2003, function () {
    console.log("Server started at port no.:2003");
})

app.use(express.static("public"));

app.get("/", function (req, resp) {

    console.log(__dirname);
    console.log(__filename);

    let path = __dirname + "/public/index.html";
    resp.sendFile(path);
})

app.use(express.urlencoded(true));

cloudinary.config({
    cloud_name: 'dd3i4mdkn',
    api_key: '935737312361299',
    api_secret: 'TLRw5QaVLWKTvLnfhzRH_2jnzYE'
});

let dbconfig = "mysql://avnadmin:AVNS_kjtQ_fmvMBy-CqgiBHw@mysql-2033b0d3-mishthi-p1.c.aivencloud.com:25049/defaultdb";
let mySqlVen = mysql2.createConnection(dbconfig);
// let mySqlVen = mysql2.createPool(dbconfig);
// console.log("Aiven connected sucessfully");

mySqlVen.connect(function (errKuch) {
    if (errKuch == null) {
        console.log("AIVEN  connected");
    }
    else {
        console.log("errKuch");
    }
})

app.get("/save-user", function (req, resp) {

    let emailid = req.query.txtEmail1;
    let password = req.query.txtPwd1;
    let utype = req.query.utype;
    
    if(utype=="none"){
        resp.send("Please select an User Type");
        return;
    }

    mySqlVen.query("insert into users values(?,?,?,current_date(),1) ;", [emailid, password, utype], function (errKuch) {

        if (errKuch == null) {

            resp.send("Record Saved Successfully.......");
        }
        else {
            resp.send(errKuch.message);
        }
    })

})

app.get("/do-login", function (req, resp) {

    let emailid = req.query.txtEmail2;
    let password = req.query.txtPwd2;

    console.log(emailid + "  "+ password);

    mySqlVen.query("select * from users where emailid=? and passwrod=? ", [emailid, password], function (err, allRecords) {


        if(err==null)
        {
            if (allRecords[0].status == 0) {
                resp.send("Blocked");
            }
             else if(allRecords.length == 0) 
                {
                  resp.send("Invalid user");
 //resp.send(`Valid\n User Type: ${utype}`);
            }
        
        else
                resp.send(allRecords[0].utype);
    }
    else
        resp.send(err.message);
    })
})

// app.get("/forgot-password", function (req, resp) {

//     let emailid = req.query.txtEmail3;
//     let password = req.query.txtPwd3;
//     let utype = req.query.utype;

//     if(utype=="none"){
//         resp.send("Please select an User Type");
//         return;
//     }

//     mySqlVen.query("update users set password=? where emailid=? and utype=?;", [password, emailid, utype], function (err) {
//         if (err == null) {
//             resp.send("New Password Saved Successfully");
//         }
//         else
//             resp.send("An error has occurred. Please try again.");
//     })

// })

app.post("/do-send-to-server", async function (req, resp) {

    let picurl = "";
    if (req.files != null) {
        let fName = req.files.RegCertificate.name;
        let fullPath = __dirname + "/public/Upload/" + fName;
        req.files.RegCertificate.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            // console.log(picurl);
        });
    }
    else
        picurl = "nopic.jpg";

    let Email_ID = req.body.txtEmail3;
    let Organisation_Name = req.body.txtOrgName;
    let Registration_Number = req.body.txtRegNumber;
    let Address = req.body.txtAddress;
    let City = req.body.txtCity;
    let State = req.body.txtState;
    let Deals_In_Sports = req.body.txtDealsInSports;
    let Head = req.body.txtHead;
    let Website = req.body.txtWebsite;
    let Insta = req.body.txtInsta;
    let Contact = req.body.txtContact;
    let Comments = req.body.txtComments;

    mySqlVen.query("insert into org_details values(?,?,?,?,?,?,?,?,?,?,?,?,?) ;", [Email_ID, Organisation_Name, Registration_Number, Address, City, State, Deals_In_Sports, Head, Website, Insta, Contact, picurl, Comments], function (errKuch) {

        if (errKuch == null) {

            resp.send("Record Saved Successfully !");
        }
        else
            resp.send(errKuch);
    })

})

app.get("/do-search", function (req, resp) {

    let Email_ID = req.query.txtEmail3;

    let query = "select * from org_details where Email_ID=?;";

    mySqlVen.query(query, [Email_ID], function (err, allRecords) {

        if (allRecords.length == 0)
            resp.send("Organization not recognized. Please check and try again.");
        else
            resp.json(allRecords);

    })

})

app.post("/Modify-user", async function (req, resp) {

    let picurl = "";
    if (req.files != null) {
        let fName = req.files.RegCertificate.name;
        let fullPath = __dirname + "/public/Upload/" + fName;
        req.files.RegCertificate.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = req.body.hdn;

    let Email_ID = req.body.txtEmail3;
    let Organisation_Name = req.body.txtOrgName;
    let Registration_Number = req.body.txtRegNumber;
    let Address = req.body.txtAddress;
    let City = req.body.txtCity;
    let State = req.body.txtState;
    let Deals_In_Sports = req.body.txtDealsInSports;
    let Head = req.body.txtHead;
    let Website = req.body.txtWebsite;
    let Insta = req.body.txtInsta;
    let Contact = req.body.txtContact;
    let Comments = req.body.txtComments;

    mySqlVen.query("update org_details set  Organisation_Name=?, Registration_Number=?, Address=?, City=?, State=?, Deals_In_Sports=?, Head=?, Website=?, Insta=?, Contact=?, Registration_Certificate=?, Comments=? where Email_ID=? ;", [Organisation_Name, Registration_Number, Address, City, State, Deals_In_Sports, Head, Website, Insta, Contact, picurl, Comments, Email_ID], function (err, result) {

        
            if (err == null) {
                resp.send("Modified Successfully ...");
            }
            else
                resp.send(err.message);
        
    })
})

app.post("/do-publish", function (req, resp) {

    let Email_ID = req.body.txtEmail4;
    let Event_Name = req.body.txtEvent;
    let DOE = req.body.doe;
    let TOE = req.body.toe;
    let Address = req.body.txtVenue;
    let City = req.body.txtCity2;
    let Sport = req.body.comboSport;
    let Min_age = req.body.min_age;
    let Max_age = req.body.max_age;
    let LastDate = req.body.last_date;
    let Fee = req.body.fee;
    let Prize = req.body.prize;
    let Contact = req.body.txtContact2;
    let R_ID = null;

    query = "insert into tournament_details values(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ;";
    mySqlVen.query(query, [R_ID, Email_ID, Event_Name, DOE, TOE, Address, City, Sport, Min_age, Max_age, LastDate, Fee, Prize, Contact], function (errKuch) {

        if (errKuch == null) {

            resp.send("Record Saved Successfully !");
        }
        else
            resp.send(errKuch);
    })
})


//-----------------------

app.get("/do-Fetch", function (req, resp) {

    let Email_ID = req.query.Email_ID;

    let query = "select * from tournament_details where Email_ID=?;";

    mySqlVen.query(query, [Email_ID], function (err, allRecords) {

        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.send(allRecords);

    })
})

app.get("/delete-one", function (req, resp) {

    // console.log(req.query)
    let ridKuch = req.query.ridKuch;

    mySqlVen.query("delete from tournament_details where R_ID=?", [ridKuch], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Deleted Successfully...");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);

    })
})

app.get("/do-Fetch-Users", function (req, resp) {

    mySqlVen.query("select * from users", function (err, allRecords) {

        resp.send(allRecords);
    })
})

app.get("/do-Fetch-Players", function (req, resp) {

    mySqlVen.query("select * from players where Email_ID=?", [req.query.txtEmail], function (err, allRecords) {

        resp.send(allRecords);
    })
})

app.get("/delete-player", function (req, resp) {

    let Email_ID = req.query.Email_ID;

    mySqlVen.query("delete from players where Email_ID=?", [Email_ID], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Deleted Successfuly...");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);

    })
})

app.get("/do-Fetch-Organizers", function (req, resp) {

    mySqlVen.query("select * from org_details where Email_ID=?", [req.query.txtEmail], function (err, allRecords) {

        resp.send(allRecords);
    })
})

app.get("/delete-organizer", function (req, resp) {

    let Email_ID = req.query.Email_ID;

    mySqlVen.query("delete from org_details where Email_ID=?", [Email_ID], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Deleted Successfuly...");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);

    })
})

app.get("/block-one", function (req, resp) {

    let emailid = req.query.emailid;

    mySqlVen.query("update users set status=0 where emailid=?", [emailid], function (err, result) {

        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Blocked");
            else
                resp.send("Inavlid");
        }
        else
            resp.send(err.message);
    })
})

app.get("/unblock-one", function (req, resp) {

    let emailid = req.query.emailid;

    mySqlVen.query("update users set status=1 where emailid=?", [emailid], function (err, result) {

        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Unblocked");
            else
                resp.send("Inavlid");
        }
        else
            resp.send(err.message);
    })
})

//==========================================================

async function RajeshBansalKaChirag(imgurl) {
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    

    return jsonData

}

// function convertToMySQLDate(ddmmyyyy) {
//     const [dd, mm, yyyy] = ddmmyyyy.split("-");
//     return `${yyyy}-${mm}-${dd}`;
// }

function convertToMySQLDate(dateStr) {
    if (!dateStr) return null;

    // Replace / with - to normalize
    dateStr = dateStr.replace(/\//g, "-");

    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;

    const [dd, mm, yyyy] = parts;

    // Basic sanity check
    if (yyyy.length !== 4) return null;

    return `${yyyy}-${mm}-${dd}`;
}

app.post("/do-upload", async function (req, resp) {

    let picurlA = "";
    let jsonData;
    if (req.files != null) {
        let fName = req.files.Adhaar.name;
        let fullPath = __dirname + "/public/Upload/" + fName;
        req.files.Adhaar.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {

            picurlA = picUrlResult.url;
            jsonData = await RajeshBansalKaChirag(picUrlResult.url);

            // resp.send(jsonData);
        })
    }
    else
        picurlA = "nopic.jpg";

    let picurlP = "";
    if (req.files != null) {
        let fName = req.files.ProfilePic.name;
        let fullPath = __dirname + "/public/Upload/" + fName;
        req.files.ProfilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurlP = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurlP);
        });
    }
    else
        picurlP = "nopic.jpg";
    //----------------------------------------------
    let Email_ID = req.body.txtEmail4;
    let AdhaarNumber = jsonData.adhaar_number;
    let Address = req.body.txtAddress2;
    let Contact = req.body.txtContact;
    let Game = req.body.comboSport2;
    let Comments = req.body.txtComments2;
    let dobMySQL = convertToMySQLDate(jsonData.dob);

    mySqlVen.query("insert into players values(?,?,?,?,?,?,?,?,?,?,?);", [Email_ID, picurlA, picurlP, AdhaarNumber, jsonData.name, dobMySQL, jsonData.gender, Address, Contact, Game, Comments], function (errKuch) {

        if (errKuch == null) {

            resp.send("Record uploaded Successfully !");
        }
        else
            resp.send(errKuch.message);
    })
})

app.get("/do-get-data", function (req, resp) {

    let Email_ID = req.query.txtEmail4;

    let query = "select * from players where Email_ID=?;";

    mySqlVen.query(query, [Email_ID], function (err, allRecords) {

        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);

    })

})

app.post("/do-update-player", async function (req, resp) {

    let picurlA = "";
    let jsonData;

    if (req.files != null && req.files.Adhaar != null) {
        let fName = req.files.Adhaar.name;
        let fullPath = __dirname + "/public/Upload/" + fName;
        await req.files.Adhaar.mv(fullPath);

        let result = await cloudinary.uploader.upload(fullPath);
        picurlA = result.url;
        jsonData = await RajeshBansalKaChirag(picurlA);

    }
    else {
        picurlA = req.body.hdnA;
        jsonData = {
            adhaar_number: req.body.hdnAdhaarNumber || '',
            name: req.body.hdnName || '',
            gender: req.body.hdnGender || '',
            dob: req.body.hdnDob || '',
        };
    }

    let picurlP = "";
    if (req.files != null && req.files.ProfilePic != null) {
        let fName = req.files.ProfilePic.name;
        let fullPath = __dirname + "/public/Upload/" + fName;
        await req.files.ProfilePic.mv(fullPath);

        let result = await cloudinary.uploader.upload(fullPath);
        picurlP = result.url;
    } else {
        picurlP = req.body.hdnP;
    }

    //----------------------------------------------
    let Email_ID = req.body.txtEmail4;
    let Address = req.body.txtAddress2;
    let Contact = req.body.txtContact;
    let Game = req.body.comboSport2;
    let Comments = req.body.txtComments2;
    let dobMySQL = convertToMySQLDate(jsonData.dob);

    mySqlVen.query("update players set Adhaar_url=?, ProfilePic_url=?, Adhaar_Number=?, Name=?, DOB=?, Gender=?, Address=?, Contact=?, Game=?, OtherInfo=? where Email_ID=?",
        [picurlA, picurlP, jsonData.adhaar_number, jsonData.name, dobMySQL, jsonData.gender, Address, Contact, Game, Comments, Email_ID],
        function (err, result) {
            if (err == null) {
                resp.send("Updated Successfully !");
            } else {
                resp.send(err.message);
            }
        }
    );
})

app.get("/do-fetch-all-tournaments", function (req, resp) {

    let City = req.query.kuchCity;
    let Sport = req.query.kuchSport;
    let Age = req.query.kuchAge;

    mySqlVen.query("select * from tournament_details where City=? and Sport=? and Min_age<=? and ?<=Max_age", [City, Sport, Age, Age], function (err, allRecords) {

        resp.send(allRecords);
    })
})

app.get("/do-fetch-all-cities", function (req, resp) {

    mySqlVen.query("select distinct City from tournament_details", function (err, allRecords) {

        resp.send(allRecords);

    })
})

app.get("/do-fetch-all-sports", function (req, resp) {

    mySqlVen.query("select distinct Sport from tournament_details", function (err, allRecords) {

        resp.send(allRecords);
    })
})

app.get("/do-fetch-age", function (req, resp) {

    mySqlVen.query("select distinct Min_age, Max_age from tournament_details", function (err, allRecords) {

        resp.send(allRecords);
    })
})


app.get("/do-update", function (req, resp) {

    let emailid = req.query.emailid;
    let NewPwd = req.query.NewPwd;
    let OldPwd = req.query.OldPwd;

    query1 = "select * from users where emailid=?";

    mySqlVen.query(query1, [emailid], function (errKuch, allRecords) {

        if (allRecords[0].password == OldPwd) {

            query2 = "update users set password=? where emailid=? and password=?";

            mySqlVen.query(query2, [NewPwd, emailid, OldPwd], function (err, result) {

                if (err == null) {
                    if (result.affectedRows == 1)
                        resp.send("Record Updated Successfuly ...");
                    else
                        resp.send("Inavlid");
                }
                else
                    resp.send(err.message);
            })
        }
        else {
            resp.send("Incorrect Old Password. Please try again.");
        }
    })
})
