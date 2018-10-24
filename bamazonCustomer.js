// require("dotenv").config()
var mysql = require("mysql")
var table = require("console.table")
var inquirer = require("inquirer")
// var key = require("./key.js")
// var keyPW = key.pw
// console.log(keyPW)

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazonDB"
})

connection.connect(function (err) {
    if (err) {
        console.log(err)
    }
})

function run () {
    connection.query("SELECT item_id, product_name, dept_name, price FROM products GROUP BY item_id ASC", 
        function (err, res) {
        if (err) {
            console.log(err)
        }
        console.table(res)
        inquirer.prompt([
            {
                name: "choiceID",
                message: "Which product number would you like?",
                type: "input",
                validate: function (choice) {
                    if (isNaN(choice) === true || choice > 10) {
                        console.log("\nYou must pick a number from the list!")
                        return false
                    }
                    return true
                }
            },
            {
                name: "choiceQ",
                message: "How many would you like to buy?",
                type: "input",
                validate: function (choice) {
                    if (isNaN(choice) === true) {
                        console.log("\nYou must choose a number!")
                        return false
                    }
                    return true
                }
            }]
        ).then(function (answer) {
            connection.query("SELECT * FROM products WHERE ?",
                {
                    item_id: answer.choiceID
                },
                function (err, res) {
                    if (err) {
                        console.log(err)
                    }
                    var stock
                    var price
                    var prod
                    for (var i = 0; i < res.length; i++) {
                        stock = res[i].inStock
                        price = res[i].price
                        prod = res[i].product_name
                    }
                    connection.query("UPDATE products SET ? WHERE ?",
                        [{
                            inStock: stock - answer.choiceQ
                        },
                        {
                            item_id: answer.choiceID
                        }],
                        function () {
                             if (answer.choiceQ > stock) {
                                console.log("\n-----------------------------------------------------------" +
                                    "\nSorry! We don't have that many!" +
                                    "\n-----------------------------------------------------------")
                                    run()
                            }
                            else {
                                if (answer.choiceQ == 0) {
                                    console.log("You can't order nothing!")
                                    connection.end()
                                }
                                else if (answer.choiceQ > 1) {
                                    console.log("--------------------------INVOICE--------------------------" +
                                        "\nYou ordered " + "(" + answer.choiceQ + ")" + " " + prod + "s!" +
                                        "\nYour total is: $" + price * answer.choiceQ +
                                        "\n-----------------------------------------------------------")
                                    run()
                                }
                                else {
                                    console.log("--------------------------INVOICE--------------------------" +
                                        "\nYou ordered " + "(" + answer.choiceQ + ")" + " " + prod + "!" +
                                        "\nYour total is: $" + price * answer.choiceQ +
                                        "\n-----------------------------------------------------------")
                                    run()
                                }
                            }
                        }
                    )
                }
            )
        })
    })
}
run()