//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _=require("lodash");
;const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sahil:ssssssss@cluster0.u1g0d.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema={
  name :String
};

const listSchema={
  name:String,
  items:[itemsSchema]
}

const Item=mongoose.model(
"Item",itemsSchema
);

const List=mongoose.model("List",listSchema)

const item1=new Item({
  name:"Welcome to your todolist"
});

const item2=new Item({
  name:"Hit the + button to add new item"
});

const item3=new Item({
  name:"<-- Hit this to delete the item"
});

const defaultitem=[item1,item2,item3]



app.get("/", function(req, res) {
 Item.find({},function(err,foundItems){
   if(foundItems.length===0){
     Item.insertMany(defaultitem,function(err){
       if(err) {
         console.log(err)
       }else{
         console.log("succcesfully added items to the list");
       }
     });
res.redirect("/");
   }
   else{
     res.render("list", {listTitle: "Today", newListItems: foundItems});

   }
 })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
const item=new Item({
  name:itemName
});

if(listName==="Today"){

  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+listName);
  })
}
});

app.post("/delete",function(req,res){
  const checkeditemid=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkeditemid,function(err){
      if(!err){
        console.log("succcesfully deleted");
        res.redirect("/")
      }

    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkeditemid}}},function(err,foundlist){
      if(!err){
        res.redirect("/" +listName);
      }
    })
  }


});


app.get("/:customnewlist",function(req,res){
  const customnewlist= _.capitalize(req.params.customnewlist);


List.findOne({name:customnewlist},function(err,foundlist){
  if(!err){
    if(!foundlist){
      const list= new List({
        name:customnewlist,
        items:defaultitem
      })
      list.save();
          res.redirect("/" +customnewlist);
    }else{
      res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items})
    }

  }
})


})

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.Port;
if(port==null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started succcesfully");
});
