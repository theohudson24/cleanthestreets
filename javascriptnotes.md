Theo Hudson's JavaScript Notes

\*Introduction:

Commonly Used JS Method: getElementById()
-Example: document.getElementById("demo").innerHTML = "Hello JavaScript";
-Meaning: Within the document, finds the element "demo", and edits the elements contents to say "Hello JavaScript"
-Additional: .innerHTML accesses the inside of the html element

JavaScript accepts both "" and ''

Method Example: document.getElementById("demo").style.fontSize = "35px";
-Meaning: Within the document, finds the element "demo", and edits the element to have a font size of 35px
-Additional: .style accesses CSS, .fontSize accesses the fontSize method in CSS

When adding JavaScript to a HTML file, use the <script> element and utilize JavaScript between the two tags </script>
There is no limit to how many <script></script> tags you can use within the HTML file.

\*Functions:

A function in JavaScript is a block of JavaScript code that is called.
-Example: When a button is clicked a function can be called

A function can be defined throughout the code, you can define them within the head or the bottom of the body.
Multiple functions can be defined within the same script tags.

JavaScript can be implemented through an external file:
-Example: <script src="filename.js"></script>
-filename.js:
function ourFunction(){
document.getElementById("demo").innerHTML = "Change The HTML Contents To This String";
}

The example implements the "filename.js" file into into the HTML file and allows the function to be called.
This can be placed with the head or body file, head will allow the code to be easily interpreted by each programmer.
You can implement multiple files.

\*Outputs:

JavaScript can display outputs in four different ways:
-HTML Element: Uses .innerHTML or .innerText
=> .innerHTML: use document.getElementById('testId').innerHTML = "<h2>Test Message</h2>";
=> .innerText: use document.getElementById('testId').innerText = "Test Message";

-HTML Output: document.write()
=> document.write(): use within the script tag, document.write(5+6), shows up as 11
=> Should only be used for testing purposes

-Alert Box: window.alert()
=> window.alert(): when used a window in the center of the screen pops up, can be used with a button
=> The window keyword is optional since it is found within the global scope, alert(whatever) works

-Browser Console: console.log()
=> console.log(): use for debugging, prints to the console found within html (fn + f12)

JavaScript doesn't have a printing method, window.print() prints the current html page

\*Statements:

Statements in JavaScript are executed line by line.
Statements should be finished with a semi-colon ';'.

Keywords:
-var
=> declares a variable

-let
=> declares a block variable

-const
=> declares a constant variable

-if
=> marks a block of statements to be executed on a condition

-switch
=> marks a block of statements to be executed in different cases

-for
=> marks a block of statements to be executed in a loop

-function
=> declares a function

-return
=> exits a function

-try
=> implements error handling to a block of statements

These words are reserved words and cannot be used for variable names!

Fixed variables are called literals, variable values are called variables.

Literals:
-Numbers
-Strings

Variables:
-Use var, let, const
-Example: let x; x = 6;

JavaScript uses arithmetic operators to compute values, the equals sign is used for assignment.

For comments, use // (single line )or /\* \*/ (multiple lines)

JavaScript variable names must start with a letter, a dollar sign, or an underscore.
-Subsequent characters can contain numbers, must not start with numbers.
-Variable names are case sensitive

Naming Conventions:
-Underscore: first_name
-Pascal Case: FirstName
-Lower Camel Case: firstName

Variables can be created without being declared but it is good practice to declare the variable upon creation.

Variable Rules:

1. Always declare variables.
2. Always use const if the variable should not be changed.
3. Always use const if the type should not be changed (arrays & objects).
4. Only use let if you can't use const.
5. Only use var if you must support older browsers.

The '==' operator is used to determine 'equal to'.

A good practice is to declare the variables at the beginning of the script
Varibles can be defined in-line seperated by commas, this can span multiple lines
The 'var' keyword should be the least used keyword, let and const are better for declaring variables.

let Keyword:

let variables:
-have the block scope
-must be declared before use
-cannot be redeclared within the same scope

const Keyword:

const variables:
-cannot be redeclared
-cannot be reassigned
-have block scope
-must be assigned when declared

The best usages for the const keyword are when you declare:
-An array
-An object
-A function
-A RegExp

You can change the properties or push to an array but not reassign the variable

Hoisting is an interesting concept for all of the variable types, yet it is pointless and creates room for error.

Best option is to initialize the variables at the beginning of the file/block of code.

Operators:

'=' assigns values
'+' adds values
'\*' multiplies values
'>' compares values

Most operators have the same properties as operators in other languages.

For logic, JavaScript uses &&, ||, and !.
JavaScript also has Bitwise Operators:
& => AND
| => OR
~ => NOT
^ => XOR
<< => LEFT SHIFT

> > => RIGHT SHIFT
> >
> > > => UNSIGNED RIGHT SHIFT
