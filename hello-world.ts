const message: string = "Hello World";

console.log(message);

const x: number = 5;
const y: number = 5;

console.log(x + y);

const dizi: Array<string | number | boolean> = ["koray", "ahmet", "enes", "sena"];
console.log(dizi);

dizi.push("mustafa", 15, true);
console.log(dizi);

const result = dizi.pop();
const result2 = dizi.shift();

console.log("ilk sonuç olarak kaldırılan son öge: " + result);
console.log("ikinci sonuç olarak kaldırılan ilk öge: " + result2);
console.log(dizi);
