const inquirer = require("inquirer");
const mysql = require("mysql");
const Table = require('cli-table2');

var table = new Table({
    head: ['Depart ID', 'Depart Name', 'Overhead Costs', 'Prod Sales', 'Total Profit']
});

const connection = mysql.createConnection({
	host: "localhost",
	port: "8889",
	user: "root",
	password: "root",
	database: "bamazon"
});

connection.connect(function(err){
	if(err) throw err;
	// console.log("connected as id " + connection.threadId);	
});

const query = {
    'View Products Sales by Department': function()
    {
        console.log("View Products Sales by Department");
        
        var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs,";
            query += " products.product_sales, (departments.over_head_costs - products.product_sales) AS total_profit";
            query += " FROM departments INNER JOIN products ON departments.department_name=products.department_name";
            query += " GROUP BY products.department_name;";
		connection.query(query, (err,res) =>
		{
			if(err) throw err; 
            for(var i = 0; i<res.length;i++)
            {
			     console.log(res[i].department_id);
                 table.push(
                    [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].total_profit]
                 );
            }           
 	
            console.log(table.toString());		
    	});

	},
    'Create New Department': function()
    {
        inquirer.prompt([
                            {
                                name: 'newDepartment',
                                type: 'input',
                                message: 'What is the new Department Name?'
                            },
                            {
                                name: 'overheadCosts',
                                type: 'input',
                                message: 'What are the over head costs?'
                            }
                        ]).then((data) =>
                                {
                                    connection.query('INSERT INTO departments SET ?', {
                                        department_name: data.newDepartment,
                                        over_head_costs: data.overheadCosts                                        
                                    }, (error,
                                         data) =>
                                                     {
                                                         console.log(data.affectedRows + " department inserted!\n");
                                                         console.log("Your department has been added!");
                                                     });
                                });
        
    }
};

	inquirer.prompt(
	    [
	        {
	            name: 'query',
	            type: 'list',
	            message: 'What would you like to do?',
	            choices: ['View Products Sales by Department',
	                	  'Create New Department']
	        }
	    ]
	).then((data) =>
	       {
	           query[data.query]();
	       }).catch((error) =>
	                {
	                    console.log(error);
	                });