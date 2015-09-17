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
		MAX_TRIES = 100;

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
		width = width || getWidth( element );
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
		shrink( element, longestWord, width, minimumSize, scaleFactor );

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
	Fit.allTo = function( elements, smallest )
	{
		// first see if elements is an array or a string...
		if( typeof elements === 'string' ) elements = [elements];
		if (elements.length < 1) return;

		var
			element,
			i,
			quantity = elements.length,
			toSmallest = smallest != false,
			table = [];

		// now loop through all elements
		for ( i=0; i < quantity; ++i )
		{
			element = elements[i];
			// fetch heights...
			var
				style = getComputedStyle( element ),
				font = style.getPropertyValue('font-size');

			// now store this as an object in memory
			var data = {};
			data.element = element;
			data.fontSize = parseFloat(font);
			data.fontUnits = font.split( data.fontSize )[1];
			table.push( data );
		}

		// now sort these according to the font size
		if ( !toSmallest ) table.sort(function(a, b){ return b.fontSize - a.fontSize; })
		else table.sort(function(a, b){ return a.fontSize - b.fontSize; })

		// now we have the required size
		var requested = table[0];

		// loop again and set all other elements to this size
		for ( i=0; i < quantity; ++i )
		{
			element = elements[i];
			element.style.fontSize = requested.fontSize + requested.fontUnits;
		}

		return requested.fontSize + requested.fontUnits;
	};

	Fit.allToSmallest = function( elements )
	{
		Fit.allTo( elements, true );
	};

	Fit.allToLargest = function( elements )
	{
		Fit.allTo( elements, false );
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
			height = getHeight(element),
			heightUnits = style.height.split( height )[1];

		// requested width, falls back to element width if not specified
		width = width || getWidth(element);
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

		shrink( element, spanElement, width, minimumSize, scaleFactor );

		// so now we have a pretty close match, but
		// TODO : can we scale it up by a fraction to see if it fits better?

		// now remove the outer span
		element.innerHTML = copy;

		// send back difference is size - useful for paddings
		return height - parseFloat( getHeight(element) );
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

		// requested height, falls back to element nax-height if not specified
		// WARNING : maxHeight here may return weird figure || maxHeight
		height = height || getHeight(element);
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
			if (count++ >= MAX_TRIES) { console.error('noend'); break};
		}

		element.style.maxHeight = maxHeight;
		element.style.visibility = visibility;
	};

	Fit.inLines = function( element, lines, minimumSize, scaleBy )
	{
		if (lines < 1) return 0;

		minimumSize = minimumSize || MIN_SIZE;
		// If we only want one line...
		if (lines===1) return Fit.toSingleLine( element, undefined, minimumSize );

		var
			count = 0,
			scaleFactor = scaleBy || SCALE_FACTOR,
			// and let's get the new styles now that it isn't wrapping
			style = getComputedStyle( element ),
			height = parseFloat( getHeight(element) ),
			font = style.getPropertyValue('font-size'),
			fontSize = parseFloat(font),
			fontUnits = font.split( fontSize )[1];

		while( Fit.countLines(element, false) > lines )
		{
			//console.log( count+". countLines "+Fit.countLines(element, false)+" limit:"+lines );

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

			// Make sure we don't get trapped forever
			if (count++ >= MAX_TRIES) { console.error('noend'); break};
		}
		return height - parseFloat( getHeight( element ) );
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
			var computedLineHeight = getComputedStyle(element).getPropertyValue('line-height');
			if ( isNaN( parseInt(computedLineHeight, 10) ) ) return computeLineHeight( element );
			return computedLineHeight;
		};

		var styles = getComputedStyle( element ),
			divHeight = parseFloat( styles.height || element.offsetHeight ),
			lineHeight = parseFloat( calculateLineHeight( element ) );

		// Must now do some checks to ensure that lineHeight is valid
		if (lineHeight <= 0) return 1;

		var lines = Math.ceil( divHeight / lineHeight),
			// fetch copy
			text = element.innerHTML,
			// check to see if there are any line breaks and if so add them to the count...
			numberOfLineBreaks = text && ignoreLineBreaks!==true ? (text.match(/<br/g)||[]).length : 0;

		//console.error( lineHeight, lines );
		return lines + numberOfLineBreaks;
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
		return convertor.textContent || convertor.innerText || html;
	};

	// Get the Width of an element
	function getWidth( element, margins )
	{
		return element.clientWidth || element.offsetWidth || element.getBoundingClientRect().width;
	};

	// Get the Height of an element
	function getHeight( element )
	{
		return element.clientHeight || element.offsetHeight || element.getBoundingClientRect().height;
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
	};

	// shrinking to specified width loop with optional minimumFontSize and scaleFactor
	function shrink( parent, child, width, minimumSize, scaleBy )
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
			if (count++ >= MAX_TRIES) { console.error('noend'); break};
		}
	};

	// Reference to Class
	return Fit;

}( window );
