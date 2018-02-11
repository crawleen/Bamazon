const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
	host: "localhost",
	port: "8889",
	user: "root",
	password: "root",
	database: "bamazon"
});

connection.connect(function(err){
	if(err) throw err;
	//console.log("connected as id " + connection.threadId);	
	queryAllProducts();
});

function queryAllProducts(){
	connection.query('SELECT * FROM products', function(err,res){
		if(err) throw err; 
		for (var i = 0; i < res.length; i++) {
      		console.log("ID: " + res[i].item_id + " Product: " + res[i].product_name + ": $" + res[i].price);      		
    	}
    	inquirer
		.prompt([
			{
				name: "itemID",
				type: "input",
				message: "What is the ID of the item you wish to purchase?"
			},
			{
				name: "numberPurchased",
				type: "input",
				message: "How many do you wish to purchase?"
			}
		])
		.then(function(answer){
			for (var k = 0; k < res.length; k++) {				
				if(res[k].item_id === parseInt(answer.itemID)){
					if(answer.numberPurchased >  res[k].stock_quantity){
						console.log("\nInsufficient Quantity - Not enough stock to fulfill your order.  \nPlease try a different product or purchase less.\n");
						queryAllProducts();
					}
					else{
						var totalBill = res[k].price*answer.numberPurchased;
						connection.query("UPDATE products SET stock_quantity = stock_quantity - ?, product_sales = product_sales + ? WHERE ?",
						[	answer.numberPurchased,
							totalBill,
							{
								item_id: answer.itemID
							}
						],
						function(err, res){					
							if(err) throw err;
							console.log("\nPurchase was successful!  The total bill was: $" + totalBill + "\n");
							queryAllProducts();
						});
					}	
				}
			}				
		})
	});
}

