//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose  = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//mongo "mongodb+srv://cluster0.cklgxz7.mongodb.net/test" --username KrisztianR --password u0BKuF5hNihNK8ar

mongoose.connect("mongodb+srv://KrisztianR:u0BKuF5hNihNK8ar@cluster0.cklgxz7.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
  name: String,
};

const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Items",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<--- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        }else{
          console.log("Succesfully saved default items to DB. ");
        }
      });
      res.redirect("/");
    } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:costumListName", function(req,res){
  const costumListName = _.capitalize(req.params.costumListName);

  List.findOne({name: costumListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list = new List({
          name: costumListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + costumListName);
      }else{
        //Show an existing lists
      res.render ("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });


});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){

  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log("Succesfully deleted item. ");
      res.redirect("/");
    }
  });
    }else{
  List.findOneAndUpdate({name: listName}, {$pull:{items: {_id:checkedItemId}}}, function(err, foundList){
    if(!err)
      res.redirect("/"+ listName);
  } )
}

});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started succesfully");
});
