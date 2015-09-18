// FIT Test Suite


var
    getById = function( id ){
       return document.getElementById(id);
    },
    getByClass = function( id, index ){
       var classes = document.getElementsByClassName(id);
       return index ? classes[ index ] : classes;
    };

// Fetch Unique Elements
var
    mainHeading         = getById('main-heading'),
    mainSubheading      = getById('main-subheading');

// Now fetch all divs that have certain classes and use these classes to trigger their behaviour...
var
    arrayToSingleLines       = getByClass('fit--single-line'),
    arrayInHeight            = getByClass('fit--in-height');
    arrayLongestWord         = getByClass('fit--longest-word'),
    arrayLongestWord         = getByClass('fit--longest-word'),
    arrayInLines             = getByClass('fit--in-lines');


// Here are the options...
function fitTypography()
{
    // Let us fit the entire H1 heading in one line regardless of how much copy it contains
    // You can specify the following arguments
    // Fit.toSingleLine( element, width, minimumFontSize );
    //Fit.toSingleLine( mainHeading );

    // Fit.longestWord( element, width, minimumSize );
    //Fit.countLines( mainHeading );

    // Fit.toSingleLine( element, width, minimumSize );

    // Fit.toSingleLineInSize( element, width, minimumSize, marginFactor );

    // Fit.inHeight( element, height, minimumSize );

    //Fit.countLines( mainHeading );

    // Loop through our behaviours
    var
        type,
        arrayBundled = [];

    // To Single Line
    for ( type in arrayToSingleLines )
    {
        if ( type && arrayToSingleLines.hasOwnProperty(type) )
        {
            Fit.toSingleLine( arrayToSingleLines[type] );
            //console.log(Fit.count+'. FIT - toSingleLine :',arrayToSingleLines[type] );
        }
    }


    // To Single Line
    for ( type in arrayLongestWord )
    {
        if ( arrayLongestWord.hasOwnProperty(type) )
        {
            // Fit.longestWord( element, width, minimumSize );
            //console.log(Fit.count+'. FIT - longestWord :',arrayLongestWord[type] );
            Fit.longestWord( arrayLongestWord[type] );
            arrayBundled.push( arrayLongestWord[type] );
        }
    }


    for ( type in arrayInHeight )
    {
        if ( arrayInHeight.hasOwnProperty(type) )
        {
            var
                inHeight = arrayInHeight[type],
                classNames = inHeight.className,
                heightRequested =  parseInt( classNames.split('max-height-')[1] );

            if ( isNaN(heightRequested) ) heightRequested = undefined;

            // Fit.longestWord( element, width, minimumSize );
            console.log(Fit.count+'. FIT - inHeight :', heightRequested );

            Fit.inHeight( arrayInHeight[type] , heightRequested );
            arrayBundled.push( arrayInHeight[type] );
        }
    }

    for ( type in arrayInLines )
    {
        if ( arrayInLines.hasOwnProperty(type) )
        {
            // Now determine from the element
            var
                inLines = arrayInLines[type],
                classNames = inLines.className,
                linesRequested = parseInt( classNames.split('max-lines-')[1] );

            if ( linesRequested === NaN ) linesRequested = 1;

            //console.log(Fit.count+'. FIT - inHeight :',arrayInHeight[type] );
            Fit.inLines( inLines, linesRequested );
        }
    }



    //console.error( arrayBundled );
    // Now loop through all mutltiple lines and add count classes...
    for ( type in arrayBundled )
    {
        if ( arrayBundled.hasOwnProperty(type) )
        {
            //console.error( arrayBundled[type] );
            var
                element = arrayBundled[type],
                lines = Fit.countLines( element );

            element.className += " lines-"+lines;
        }
    }

    // now let us scale all elements that are supposed to be the same size
    // Fit.allToSmallest();
    // Fit.allToLargest();
}

// Get rid of all type modifications!
function resetAll()
{
    var restArray = function( arrayOfWords )
    {
        for ( var type in arrayOfWords ) if ( arrayOfWords.hasOwnProperty(type) ) Fit.reset( arrayOfWords[type] );
    }
    restArray( arrayToSingleLines );
    restArray( arrayInLines );
    restArray( arrayInHeight );
    restArray( arrayLongestWord );
}


// wait for font to load befrore calling this...fitTypography
// FontDetect.onFontLoaded ('Playfair Display', fitTypography, fitTypography , {msTimeout: 3000});

// https://github.com/bramstein/fontfaceobserver
var observerH = new FontFaceObserver('Playfair Display', {
    weight: 700
});
observerH.check().then(fitTypography, function () {
    console.error('Font : Playfair Display is not available');
    fitTypography();
});

var observerP = new FontFaceObserver('Roboto', {
    weight: 400
});

observerH.check().then(fitTypography, function () {
    console.error('Font : Roboto is not available');
    fitTypography();
});

// or one day...
// document.fonts.ready().then(fitTypography, function(e){ alert('Webfont failed to load from Google CDN'); } );

// call the text fitting Methods immediately
// fitTypography();

// Hook into resize event!
window.addEventListener('resize', function(event){
    //fitTypography();
});

// Hook into some buttons
var demos = getById('demos');
var examples = getById('examples');

var buttonShowBorders = getById('show-borders');
if (buttonShowBorders)
{
    buttonShowBorders.addEventListener('mousedown', function(event){
        if (demos) toggleClass( demos, 'show-borders' );
        if (examples) toggleClass( examples, 'show-borders' );
        event.preventDefault();
        return false;
    });
}

var buttonReset = getById('reset-type');
if (buttonReset)
{
    buttonReset.addEventListener('mousedown', function(event){
        resetAll();
        event.preventDefault();
        return false;
    });
}


var buttonSet = getById('set-type');
if (buttonSet)
{
    buttonSet.addEventListener('mousedown', function(event){
        fitTypography();
        event.preventDefault();
    });
}

var buttonCount = getById('set-count');
if (buttonCount)
{
    buttonCount.addEventListener('mousedown', function(event){
        if (demos) toggleClass( demos, 'show-count' );
        if (examples) toggleClass( examples, 'show-count' );
        event.preventDefault();
    });
}


var demoCache = {};
function onTextChanged( inputElement, outputElement, methodToCall )
{
    // fetch value
    var
        originalValue = demoCache[inputElement],
        newValue = inputElement.value;

    if ( originalValue != newValue )
    {
        // change has occurred!
        outputElement.innerHTML = newValue;
        demoCache[ inputElement ] = newValue;
        // console.log('Text > '+newValue, methodToCall );
        methodToCall( outputElement );
    }
}

function registerDemo( inputElement, outputElement, methodToCall )
{
    if ( inputElement && outputElement )
    {
        inputElement.addEventListener('change', function(event){ onTextChanged( inputElement, outputElement, methodToCall ); } );
        inputElement.addEventListener('keyup', function(event){ onTextChanged( inputElement, outputElement, methodToCall ); } );
        inputElement.addEventListener('paste', function(event){ onTextChanged( inputElement, outputElement, methodToCall ); } );
        //inputElement.addEventListener('click', function(event){ onTextChanged( inputElement, outputElement, methodToCall ); } );
    }
}

// Now create our input field demos
var
    demoSingleLineInput = getById('input-single-line'),
    demoSingleLineOutput = getById('demo-single-line');

registerDemo( demoSingleLineInput, demoSingleLineOutput, Fit.toSingleLine );


var
    demoLongestWordInput = getById('input-longest-word'),
    demoLongestWordOutput = getById('demo-longest-word');

registerDemo( demoLongestWordInput, demoLongestWordOutput, Fit.longestWord );

var
    demoInHeightInput = getById('input-in-height'),
    demoInHeightOutput = getById('demo-in-height');

registerDemo( demoInHeightInput, demoInHeightOutput, Fit.inHeight );

var
    demoCountLinesInput = getById('input-count-lines'),
    demoCountLinesOutput = getById('demo-count-lines');

registerDemo( demoCountLinesInput, demoCountLinesOutput, setLinesClass );

function setLinesClass( element )
{
    var lines = Fit.countLines( element );
    element.className = 'lines-'+lines;
}

var
    demoMatchSizes = getByClass('demo-match-sizes'),
    demoMatchSizesInput = getById('input-match-size'),
    demoMatchSizesOutput = getById('demo-match-size');

registerDemo( demoMatchSizesInput, demoMatchSizesOutput, matchSizes );

function matchSizes( element )
{
    Fit.toSingleLine( element );
    Fit.allToSmallest( demoMatchSizes );
}

function toggleClass( el, className )
{
    if (el.classList)
    {
        el.classList.toggle(className);

    } else {

        var classes = el.className.split(' '), existingIndex = -1;
        for (var i = classes.length; i--;) if (classes[i] === className) existingIndex = i;

        if (existingIndex >= 0) classes.splice(existingIndex, 1);
        else classes.push(className);

        el.className = classes.join(' ');
    }
}
