// Polyfills ===============================================================================
"use strict";

window.getComputedStyle || (window.getComputedStyle = function(el) {
    return this.el = el, this.getPropertyValue = function(prop) {
        var re = /(\-([a-z]){1})/g;
        return "float" === prop && (prop = "styleFloat"), re.test(prop) && (prop = prop.replace(re, function() {
            return arguments[2].toUpperCase();
        })), el.currentStyle[prop] ? el.currentStyle[prop] : null;
    }, this;
}), window.Fit = function() {
    function convertToText(html) {
        return convertor.innerHTML = html, convertor.textContent || convertor.innerText || "";
    }
    function getWidth(element) {
        return element.clientWidth || element.offsetWidth || element.getBoundingClientRect().width;
    }
    function getHeight(element) {
        return element.clientHeight || element.offsetHeight || element.getBoundingClientRect().height;
    }
    function uniqueID() {
        return "FIT_" + Fit.count++;
    }
    function computeLineHeight(element) {
        var clone, singleLineHeight, doubleLineHeight, br = "<br>";
        return clone = element.cloneNode(), clone.innerHTML = br, element.appendChild(clone), 
        singleLineHeight = clone.offsetHeight, clone.innerHTML = br + br, doubleLineHeight = clone.offsetHeight, 
        element.removeChild(clone), doubleLineHeight - singleLineHeight;
    }
    function shrink(parent, child, width, minimumSize, scaleBy) {
        for (var count = 0, scaleFactor = scaleBy || 1, style = getComputedStyle(parent), font = style.getPropertyValue("font-size"), fontSize = parseFloat(font), fontUnits = font.split(fontSize)[1]; getWidth(child) >= width && (fontSize -= scaleFactor, 
        minimumSize > fontSize && (fontSize = minimumSize, count = MAX_TRIES), parent.style.fontSize = fontSize + fontUnits, 
        !(count++ >= MAX_TRIES)); ) ;
    }
    var MAX_TRIES = 1e5, Fit = {}, convertor = document.createElement("DIV");
    Fit.count = 0, Fit.MIN_SIZE = 6, Fit.SCALE_FACTOR = 1, Fit.longestWord = function(element, width, minimumSize, scaleBy) {
        minimumSize = minimumSize || Fit.MIN_SIZE, width = width || getWidth(element), width = parseFloat(width);
        var longestWord, scaleFactor = scaleBy || Fit.SCALE_FACTOR, visibility = element.style.visibility, copy = element.innerHTML, text = convertToText(copy), words = text.split(" ").sort(function(a, b) {
            return b.length - a.length;
        }), wordIDs = [], quantity = words.length < 10 ? words.length : 10;
        element.style.visibility = "hidden";
        for (var w = 0; quantity > w; ++w) {
            var id = uniqueID(), word = words[w];
            words[w] = '<span id="' + id + '">' + word + "</span>", wordIDs.push(id);
        }
        var reassembled = words.join(" ");
        element.innerHTML = reassembled, longestWord = document.getElementById(wordIDs[0]), 
        longestWord.style.whiteSpace = "nowrap";
        for (var largestWidth = getWidth(longestWord), i = 1, q = wordIDs.length; q > i; ++i) {
            var wordElement = document.getElementById(wordIDs[i]), wordWidth = getWidth(wordElement);
            wordElement.style.whiteSpace = "nowrap", wordWidth > largestWidth && (largestWidth = wordWidth, 
            longestWord = wordElement);
        }
        shrink(element, longestWord, width, minimumSize, scaleFactor), element.innerHTML = copy, 
        element.style.visibility = visibility;
    }, Fit.allTo = function(elements, smallest) {
        if (!("string" == typeof elements || elements.length < 1)) {
            var i, element, quantity = elements.length, toSmallest = smallest !== !1, table = [];
            for (i = 0; quantity > i; ++i) {
                element = elements[i];
                var style = getComputedStyle(element), font = style.getPropertyValue("font-size"), data = {};
                data.element = element, data.fontSize = parseFloat(font), data.fontUnits = font.split(data.fontSize)[1], 
                table.push(data);
            }
            toSmallest ? table.sort(function(a, b) {
                return a.fontSize - b.fontSize;
            }) : table.sort(function(a, b) {
                return b.fontSize - a.fontSize;
            });
            var requested = table[0];
            for (i = 0; quantity > i; ++i) element = elements[i], element.style.fontSize = requested.fontSize + requested.fontUnits;
            return requested.fontSize + requested.fontUnits;
        }
    }, Fit.allToSmallest = function(elements) {
        Fit.allTo(elements, !0);
    }, Fit.allToLargest = function(elements) {
        Fit.allTo(elements, !1);
    }, Fit.toSingleLine = function(element, width, minimumSize, scaleBy) {
        var id = uniqueID(), scaleFactor = scaleBy || Fit.SCALE_FACTOR, height = getHeight(element);
        width = width || getWidth(element), width = parseFloat(width), minimumSize = minimumSize || Fit.MIN_SIZE;
        var copy = element.innerHTML;
        element.innerHTML = "<span id=" + id + ">" + copy + "</span>";
        var spanElement = document.getElementById(id);
        return spanElement.style.visibility = "hidden", spanElement.style.whiteSpace = "nowrap", 
        shrink(element, spanElement, width, minimumSize, scaleFactor), element.style.whiteSpace = "nowrap", 
        element.innerHTML = copy, height - parseFloat(getHeight(element));
    }, Fit.inHeight = function(element, height, minimumSize, scaleBy) {
        minimumSize = minimumSize || Fit.MIN_SIZE;
        var count = 0, scaleFactor = scaleBy || Fit.SCALE_FACTOR, style = getComputedStyle(element), visibility = style.getPropertyValue("visibility"), maxHeight = style.getPropertyValue("max-height"), font = style.getPropertyValue("font-size"), fontSize = parseFloat(font), fontUnits = font.split(fontSize)[1];
        for (height = height || getHeight(element), height = parseFloat(height), element.style.maxHeight = height + "px", 
        element.style.visibility = "hidden"; (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) && (element.clientHeight === element.scrollHeight && alert("fucked " + element.clientHeight + "===" + element.scrollHeight), 
        fontSize -= scaleFactor, minimumSize > fontSize && (fontSize = minimumSize, count = MAX_TRIES), 
        element.style.fontSize = fontSize + fontUnits, !(count++ >= MAX_TRIES)); ) ;
        element.style.maxHeight = maxHeight, element.style.visibility = visibility;
    }, Fit.inLines = function(element, lines, minimumSize, scaleBy) {
        if (1 > lines) return 0;
        if (minimumSize = minimumSize || Fit.MIN_SIZE, 1 == lines) return Fit.toSingleLine(element, void 0, minimumSize);
        for (var count = 0, scaleFactor = scaleBy || Fit.SCALE_FACTOR, style = getComputedStyle(element), height = parseFloat(getHeight(element)), font = style.getPropertyValue("font-size"), fontSize = parseFloat(font), fontUnits = font.split(fontSize)[1]; Fit.countLines(element, !1) > lines && (fontSize -= scaleFactor, 
        minimumSize > fontSize && (fontSize = minimumSize, count = MAX_TRIES), element.style.fontSize = fontSize + fontUnits, 
        !(count++ >= MAX_TRIES)); ) ;
        return height - parseFloat(getHeight(element));
    }, Fit.countLines = function(element, ignoreLineBreaks) {
        if (!element) return 0;
        var calculateLineHeight = function(element) {
            var computedLineHeight = getComputedStyle(element).getPropertyValue("line-height");
            return isNaN(parseInt(computedLineHeight, 10)) ? computeLineHeight(element) : computedLineHeight;
        }, divHeight = parseFloat(getHeight(element)), lineHeight = parseFloat(calculateLineHeight(element));
        if (0 >= lineHeight) return 1;
        var lines = Math.ceil(divHeight / lineHeight), text = element.innerHTML, numberOfLineBreaks = text && ignoreLineBreaks !== !0 ? (text.match(/<br/g) || []).length : 0;
        return lines + numberOfLineBreaks;
    }, Fit.reset = function(element) {
        element.removeAttribute("style");
    };
    var patternBr = new RegExp("<br ?/?>");
    return Fit.hasBr = function(text) {
        return patternBr.test(text);
    }, Fit;
}(window);