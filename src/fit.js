// Polyfills ===============================================================================

// Internet Explorer 8 Poly Fill
if (!window.getComputedStyle)
{
	window.getComputedStyle = function(el, pseudo) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop === 'float') prop = 'styleFloat';
			if (re.test(prop)) {
				prop = prop.replace(re, function () {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		}
		return this;
	}
}

// FIT : A JavaScript Text Resizing Toolset ================================================

// global access : Fit.access()
window.Fit = function(){

	"use strict"

	var
		MIN_SIZE = 6,
		SCALE_FACTOR = 1,
		MAX_TRIES = 100000;

	// Output
	var
		Fit = {},
		convertor = document.createElement("DIV");

	// internal counter
	Fit.count = 0;

	/////////////////////////////////////////////////////////////////
	// Finds the longest word and uses that to scale all of the fonts
	// For use mainly on thin elements with ong words that don't wrap
	//
	// USE CASE: 	Long words in thin sections
	// ACTION:		Scales DOWN *ONLY*
	// NB. 			Only use on SHORT paragraphs
	/////////////////////////////////////////////////////////////////
	Fit.longestWord = function( element, width, minimumSize, scaleBy )
	{
		minimumSize = minimumSize || MIN_SIZE;
		// requested width, falls back to element width if not specified
		width = width || getComputedStyle( element ).width;
		// make sure we just get the number
		width = parseFloat(width);

		var
			scaleFactor = scaleBy || SCALE_FACTOR,
			visibility = element.style.visibility,
			// save original text
			copy = element.innerHTML,
			// get rid of html
			text = convertToText( copy ),
			// arrange array from big to small / ASC -> a - b; DESC -> b - a
			words = text.split(" ").sort(function(a, b){ return b.length - a.length; }),
			// holder for pointers to words
			wordIDs = [],
			// presumably the longest word is the widest?
			longestWord,
			// how many long words should we test?
			quantity = words.length < 10 ? words.length : 10;

		// hide from screen!
		element.style.visibility = 'hidden';

		// loop through top ten(-ish) words...
		for (var w=0; w<quantity; ++w)
		{
			var
				id = uniqueID(),
				word = words[w];

			words[w] = '<span id="'+id+'">'+word+'</span>';
			wordIDs.push( id );
		}

		// re combine the words
		var reassembled = words.join(" ");
		element.innerHTML = reassembled;

		// Fetch expected largest
		var longestWord = document.getElementById( wordIDs[0] );
		longestWord.style.whiteSpace = "nowrap";

		// loop through the top selections just to be sure of their sizes
		var largestWidth = getWidth( longestWord );
		for (var i=1,q=wordIDs.length; i<q; ++i)
		{
			var
				wordElement = document.getElementById( wordIDs[i] ),
				wordWidth = getWidth( wordElement);

			wordElement.style.whiteSpace = "nowrap";

			// we have found a wider word!
			if ( wordWidth > largestWidth )
			{
				largestWidth = wordWidth;
				longestWord = wordElement;
			}
		}

		// now we must scale down to small...#
		loop( element, longestWord, width, minimumSize, scaleFactor );

		// now remove the spans
		element.innerHTML = copy;

		// show
		element.style.visibility = visibility;
	};

	/////////////////////////////////////////////////////////////////
	// Modifies the DOM to add span wrappers around long words that
	// are too big to fit in the specified width
	//
	// USE CASE: 	Shrink only Long words in thin sections
	// ACTION:		Scales DOWN *ONLY*
	// NB. 			Only use on VERY SHORT paragraphs
	/////////////////////////////////////////////////////////////////
	Fit.longWords = function( element, width, minimumSize, scaleBy )
	{
		minimumSize = minimumSize || MIN_SIZE;
		// requested width, falls back to element width if not specified
		width = width || getComputedStyle( element ).width;
		// make sure we just get the number
		width = parseFloat(width+'');

		var
			scaleFactor = scaleBy || SCALE_FACTOR,
			visibility = element.style.visibility,
			// save original text
			copy = element.innerHTML,
			// get rid of html
			text = convertToText( copy ),
			// arrange array from big to small / ASC -> a - b; DESC -> b - a
			words = text.split(" ").sort(function(a, b){ return b.length - a.length; }),
			// holder for pointers to words
			wordIDs = [],
			// presumably the longest word is the widest?
			longestWord,
			// how many long words should we test?
			quantity = words.length < 10 ? words.length : 10;

		// hide from screen!
		element.style.visibility = 'hidden';

		// loop through top ten(-ish) words...
		for (var w=0; w<quantity; ++w)
		{
			var
				id = uniqueID(),
				word = words[w];

			words[w] = '<span id="'+id+'">'+word+'</span>';
			wordIDs.push( id );
		}

		// re combine the words
		var reassembled = words.join(" ");
		element.innerHTML = reassembled;

		// Now we want to loop through all of these long words from longest tp shortest
		// and check to see if their widths are longer than allowable
		// loop through the top selections just to be sure of their sizes
		for (var i=0,q=wordIDs.length; i<q; ++i)
		{
			var
				wordElement = document.getElementById( wordIDs[i] ),
				wordWidth = getWidth( wordElement);

			wordElement.style.whiteSpace = "nowrap";

			// we have found a word wider than permitted width!
			if ( wordWidth > width )
			{
				// scale down...
				loop( wordElement, wordElement, width, minimumSize, scaleFactor );
			}
		}

		// show
		element.style.visibility = visibility;
	};


	/////////////////////////////////////////////////////////////////
	// Fit the text in this element to the specified width
	// If no width is specified, it will use the element's width
	// ACTION:	Scales DOWN *ONLY*
	/////////////////////////////////////////////////////////////////
	Fit.toSingleLine = function( element, width, minimumSize, scaleBy )
	{
		var
			id = uniqueID(),
			scaleFactor = scaleBy || SCALE_FACTOR,
			style = getComputedStyle( element ),
			height = parseFloat( style.height ),
			heightUnits = style.height.split( height )[1];

		// requested width, falls back to element width if not specified
		width = width || style.width;
		// make sure we just get the number
		width = parseFloat(width);
		// set minimum fon size
		minimumSize = minimumSize || MIN_SIZE;

		var copy = element.innerHTML;
		element.innerHTML = '<span id='+id+'>'+copy+'</span>';

		// fetch our new element
		var spanElement	= document.getElementById(id);
		// and set it to hidden
		spanElement.style.visibility = 'hidden';
		// so now let's set no-wrap for one-lined text
		spanElement.style.whiteSpace = "nowrap";

		loop( element, spanElement, width, minimumSize, scaleFactor );

		// so now we have a pretty close match, but
		// TODO : can we scale it up by a fraction to see if it fits better?

		// now remove the outer span
		element.innerHTML = copy;

		// send back difference is size - useful for paddings
		return height - parseFloat(  getComputedStyle( element ).height );
	};


	/////////////////////////////////////////////////////////////////
	// Shrinks a paragraph by font-size until it's height matches
	// the specified or under
	/////////////////////////////////////////////////////////////////
	Fit.inHeight = function( element, height, minimumSize, scaleBy )
	{
		// always have a minimum font size
		minimumSize = minimumSize || MIN_SIZE;

		// shrink font until the height fits
		var
			count = 0,
			scaleFactor = scaleBy || SCALE_FACTOR,
			// and let's get the new styles now that it isn't wrapping
			style = getComputedStyle( element ),
			visibility = style.getPropertyValue('visibility'),
			maxHeight = style.getPropertyValue('max-height'),
			font = style.getPropertyValue('font-size'),
			fontSize = parseFloat(font),
			fontUnits = font.split( fontSize )[1],
			scrollHeight = element.scrollHeight;

		// requested width, falls back to element width if not specified
		// WARNING : maxHeight here may return weird figure || maxHeight
		height = height || style.height;
		// make sure we just get the number
		height = parseFloat(height);

		element.style.maxHeight = height + 'px';
		element.style.visibility = 'hidden';

		while ( (element.clientHeight >= height) || (element.scrollWidth > element.clientWidth) )
		{
			// compare against requested size
			fontSize -= scaleFactor;

			// Make sure we do not go below our threshold...
			if ( fontSize < minimumSize )
			{
				fontSize = minimumSize;
				count = MAX_TRIES;
			}

			// Try out our new size
			element.style.fontSize = fontSize + fontUnits;
			//console.log( scrollHeight+". Setting fontSize "+fontSize+" element.scrollHeight "+element.scrollHeight+ " element.clientHeight "+element.clientHeight );

			// Make sure we don't get trapped forever
			if (element.clientHeight == element.scrollHeight) break;
			if (count++ >= MAX_TRIES) break;
		}

		element.style.maxHeight = maxHeight;
		element.style.visibility = visibility;

	};

	Fit.inLines = function( element, lines, minimumSize, scaleBy )
	{
		if (lines < 1) return 0;
		// If we only want one line...
		if (lines==1) return Fit.toSingleLine( element, undefined, minimumSize );

		var lineHeight = computeLineHeight( element );
		var expectedHeight = lineHeight * 2;
		var
			count = 0,
			scaleFactor = scaleBy || SCALE_FACTOR,
			// and let's get the new styles now that it isn't wrapping
			style = getComputedStyle( element ),
			height = parseFloat( style.height ),
			font = style.getPropertyValue('font-size'),
			fontSize = parseFloat(font),
			fontUnits = font.split( fontSize )[1];

		while( Fit.countLines(element, true) > lines )
		{
			// compare against requested size
			fontSize -= scaleFactor;

			// Make sure we do not go below our threshold...
			if ( fontSize < minimumSize )
			{
				fontSize = minimumSize;
				count = MAX_TRIES;
			}

			// Try out our new size
			element.style.fontSize = fontSize + fontUnits;
			// console.log( count+". Setting fontSize "+fontSize+" to width "+width+ " from "+getWidth( spanElement ) );

			// Make sure we don't get trapped forever
			if (count++ >= MAX_TRIES) break;
		}
		return height - parseFloat( getComputedStyle( element ).height );
	};

	/////////////////////////////////////////////////////////////////
	// How many lines has this text node element got?
	// TODO : Check to see how the internal contents affect things...
	// If there are inner spans, this will return a false output
	/////////////////////////////////////////////////////////////////
	Fit.countLines = function( element, ignoreLineBreaks )
	{
		if (!element) return 0;

		// http://stackoverflow.com/questions/4392868/javascript-find-divs-line-height-not-css-property-but-actual-line-height
		var calculateLineHeight = function(element)
		{
			var lineHeight = getComputedStyle(element, 'line-height');
			if ( isNaN( parseInt(lineHeight, 10) ) ) return computeLineHeight( element );
			return lineHeight;
		};

		var styles = getComputedStyle( element ),
			divHeight = parseFloat( styles.height || element.offsetHeight ),
			// parseFloat()
			lineHeight = calculateLineHeight( element );
			//element.style.lineHeight || styles.getPropertyValue('lineHeight') || styles['line-height'];

		// Must now do some checks to ensure that lineHeight is valid
		//lines = divHeight / parseInt( lineHeight );
		var lines = Math.ceil( divHeight / lineHeight ) - 1,
			// fetch copy
			text = element.innerHTML,
			// check to see if there are any line breaks and if so add them to the count...
			numberOfLineBreaks = text && ignoreLineBreaks!==true ? (text.match(/<br/g)||[]).length : 0;
			//console.error( lineHeight, styles.getPropertyValue('line-height'), element.style.lineHeight,  parseInt( styles['line-height']) );

		// 1 is the orignal line
		return lines + numberOfLineBreaks + 1;
	};

	/////////////////////////////////////////////////////////////////
	// Remove any scaling currently applied
	/////////////////////////////////////////////////////////////////
	Fit.reset = function( element )
	{
		// remove any inline styling...
		element.removeAttribute('style');
	};

	// Private Methods ---------------------------------------------------------------------
	/*
	// Return a number only version of a composite string
	function onlyNumbers(string)
	{
		return parseFloat( string.match(/[0-9]+/g, '')[0]);
	};
	*/
	function convertToText( html )
	{
		convertor.innerHTML = html;
		return convertor.textContent || convertor.innerText || "";
	};

	// Get the Width of an element
	function getWidth( element, margins )
	{
		var width = element.offsetWidth;
		if ( margins === true )
		{
			var style = getComputedStyle(element);
			return width + parseInt(style.marginLeft) + parseInt(style.marginRight);
		}else{
			return width;
		}
	};

	function uniqueID()
	{
		return 'FIT_' + (Fit.count++);
	};
	function computeLineHeight( element )
	{
		var
			br = '<br>',
			clone,
			singleLineHeight,
			doubleLineHeight;

		clone = element.cloneNode();
		clone.innerHTML = br;
		element.appendChild(clone);
		singleLineHeight = clone.offsetHeight;
		clone.innerHTML = br + br;
		doubleLineHeight = clone.offsetHeight;
		element.removeChild(clone);

		return doubleLineHeight - singleLineHeight;
	}

	// shrinking to specified width loop with optional minimumFontSize and scaleFactor
	function loop( parent, child, width, minimumSize, scaleBy )
	{
		var
			count = 0,
			scaleFactor = scaleBy || 1,
			// and let's get the new styles now that it isn't wrapping
			style = getComputedStyle( parent ),
			font = style.getPropertyValue('font-size'),
			fontSize = parseFloat(font),
			fontUnits = font.split( fontSize )[1];

		while( getWidth( child ) >= width )
		{
			// compare against requested size
			fontSize -= scaleFactor;

			// Make sure we do not go below our threshold...
			if ( fontSize < minimumSize )
			{
				fontSize = minimumSize;
				count = MAX_TRIES;
			}

			// Try out our new size
			parent.style.fontSize = fontSize + fontUnits;
			// console.log( count+". Setting fontSize "+fontSize+" to width "+width+ " from "+getWidth( spanElement ) );

			// Make sure we don't get trapped forever
			if (count++ >= MAX_TRIES) break;
		}
	};

	// Reference to Class
	return Fit;

}( window );
