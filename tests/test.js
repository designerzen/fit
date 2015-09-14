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
    arrayInLines             = getByClass('fit--in-lines'),
    arrayLongWords           = getByClass('fit--long-words');


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

    for ( type in arrayLongWords )
    {
        if ( arrayLongWords.hasOwnProperty(type) )
        {
            // Fit.longestWord( element, width, minimumSize );
            //console.log(Fit.count+'. FIT - longWords :',arrayLongWords[type] );
            Fit.longWords( arrayLongWords[type] );
            arrayBundled.push( arrayLongWords[type] );
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
    restArray( arrayLongWords );
}

// wait for font to load befrore calling this...fitTypography
FontDetect.onFontLoaded ('Playfair Display', fitTypography, fitTypography , {msTimeout: 3000});

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
buttonShowBorders.addEventListener('mousedown', function(event){
    toggleClass( demos, 'show-borders' );
    toggleClass( examples, 'show-borders' );
    event.preventDefault();
    return false;
});

var buttonReset = getById('reset-type');
buttonReset.addEventListener('mousedown', function(event){
    resetAll();
    event.preventDefault();
    return false;
});

var buttonSet = getById('set-type');
buttonSet.addEventListener('mousedown', function(event){
    fitTypography();
    event.preventDefault();
});


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
