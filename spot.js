// file: spot.js
// author: samuel oosterhuis

//
// namespace mechanism from:
// http://stackoverflow.com/questions/881515/javascript-namespace-declaration
// 			and
// http://enterprisejquery.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
//
(function( spot_ns, $, undefined ) {

	//
	// more global variables...
	//
	
	spot_ns.iOptions = {
		"selector" 	: "span.tIngs",
		"selected" 	: "span.tIngs.label-warning",
		"selClass" 	: "tIngs label label-warning",
		"notClass" 	: "tIngs",
		"global"	 	: spot_ns.gi,
		"list"			: "#ingredient-list",
		"fpSelect"	: selectIngredient,
	 	"type"			: "i",
	};

	spot_ns.eOptions = {
		"selector"  : "span.tEffs",
		"selected"  : "span.tEffs.label-info",
		"selClass"  : "tEffs label label-info",
		"notClass"  : "tEffs",
		"global"	  : spot_ns.ge,
		"list"			: "#effects-list",
		"fpSelect"	: selectEffect,
	 	"type"			: "e",
	};

	spot_ns.allIngredients 	= new Array();
	spot_ns.allEffects 			= new Array();
	spot_ns.favorites				= null;

	// needs to be reset _every_ pass through...
	var netIndex = null, validEff = null, validIng = null, ingScopeFilter = null, effScopeFilter = null; 

function selectIngredient()
{
	$(this).toggleClass( "label" ).toggleClass( "label-warning" );
	redraw();
	return( false );
}

function selectEffect()
{
	$(this).toggleClass( "label" ).toggleClass( "label-info" );
	redraw();
	return( false );
}

function getSortedKeys( obj )
{
	if( !obj ){ return( null ); }

	var result = new Array();
	$.each( obj, function( key, value ) { result.push( key ); });
	return( result.sort() );
}

function filterPotions( selected, num, options, netIndex )
{
	if( !selected || num == 0 ){ return( netIndex ); }
	for( var i in selected ) { netIndex = merge( netIndex, spot_ns.idx[options.type][i] ); }
	return( netIndex );
}


function redraw()
{
	var selEff = new Object(), selIng = new Object(), numSelEff = 0, numSelIng = 0,
		validEffects = new Object(), validIngredients = new Object(), i, ing, eff;

	netIndex = null;

	$( spot_ns.eOptions.selected ).each( function() { ++numSelEff; selEff[ $(this).text() ] = 1; });
	$( spot_ns.iOptions.selected ).each( function() { ++numSelIng; selIng[ $(this).text() ] = 1; });

	// 
	// first filter all potential potions
	// (this will be used as the base for filters for ingredients and effects later)
	//
	
	// the scope filters - num ingredients and num effects
	if( ingScopeFilter ) { netIndex = merge( netIndex, ingScopeFilter ); }
	if( effScopeFilter ) { netIndex = merge( netIndex, effScopeFilter ); }

	// filter based on selected ingredients and effects
	netIndex = filterPotions( selEff, numSelEff, spot_ns.eOptions, netIndex );
	netIndex = filterPotions( selIng, numSelIng, spot_ns.iOptions, netIndex );

	//
	// note that netIndex could still be _null_ at this point
	// and that just means that no filters have been applied
	//

	//
	// and now filter the lists of effects and ingredients
	//
	if( netIndex == null )
	{
		validEff = spot_ns.allEffects;
		validIng = spot_ns.allIngredients;
	}
	else
	{

		for( i in netIndex )
		{
			for( ing in spot_ns.gp[ netIndex[i] ][ "i" ] )
			{
				validIngredients[ spot_ns.gp[ netIndex[i] ][ "i" ][ ing ] ] = 1;
			}

			for( eff in spot_ns.gp[ netIndex[i] ][ "e" ] )
			{
				validEffects[ spot_ns.gp[ netIndex[i] ][ "e" ][ eff ] ] = 1;
			}
		}
		validIng = getSortedKeys( validIngredients );
		validEff = getSortedKeys( validEffects );

	}

	spot_ns.display( validIng, selIng, spot_ns.iOptions ); 
	spot_ns.display( validEff, selEff, spot_ns.eOptions ); 

	displayPotions( netIndex );
	spot_ns.displayFavorites( spot_ns.favorites );

	return( false );
}

spot_ns.display = function( validList, sel, options )
{
	$( options.list ).empty();

	for( var i in validList )
	{
		$( options.list ).append( "<p><span class=\""
				+ ( validList[i] in sel ? options.selClass : options.notClass )
				+ "\">" + validList[i] + "</span></p>" );
	}

	$( options.selector ).click( options.fpSelect );
};

function displayPotions( index )
{
	$("#potion-list").empty();

	var count=0,i;
	for( i in index )
	{
		$("#potion-list").append( "<li class='tPots' draggable='true' data-potion='"+index[i]+"'>" + potionString( spot_ns.gp[index[i]] ) + "</li>" );

		// speed up improvements
		if( ++count > 50 ) 
		{ 
			$("#potion-list").append( "<li draggable='false'><i>&lt; list truncated &gt;</li>" );
			break; 
		}
	}

	$( '.tPots' ).click( addFavorite );
}

spot_ns.displayFavorites = function( list )
{
	$("#favorites-list").empty();
	if( list == null )
	{
		spot_ns.favorites = new Object;
		spot_ns.favorites[ 'Basic Restore Health' ] = 1825;
		spot_ns.favorites[ 'Five Effect Poison' ] = 1756;
		spot_ns.favorites[ 'Valuable Potion' ] = 7341;
		list = spot_ns.favorites;
	}

	for( i in list )
	{
		$("#favorites-list").append( '<p><span class="tFav" data-potion="' +list[i]+'" data-name="' +i+'"><i class="icon-plus-sign icon-white"></i> &nbsp; ' +i+'</span></p>' );
	}

	$( 'span.tFav' ).click( displayFavForm );
}

spot_ns.saveFavorite = function()
{
	$('#modalFavorite').modal('hide');

	if( $(this).text().substring(0,3) == "Add" ) { spot_ns.favorites[ $('#customName' ).val() ] = spot_ns.potionNum; }
	else { delete spot_ns.favorites[ $('#customName' ).val() ]; }
	localStorage.setItem( 'spot-favorites', JSON.stringify( spot_ns.favorites ));

	spot_ns.displayFavorites( spot_ns.favorites );
	return( false );
}


function displayFavForm()
{
	spot_ns.potionNum = $(this).attr('data-potion');
	spot_ns.potionName = $(this).attr('data-name');

	$('#customName' ).prop( 'value', spot_ns.potionName );
	$('#potionContents').empty();
	//$('#potionContents').append( '<p><b>'+	spot_ns.potionNum + '</b></p>' );
	// <button id="addToFav" type="submit" class="btn">Add to Favorites</button>
	$('#addToFav').html('Remove from Favorites');
	$('#potionContents').append( potionString( spot_ns.gp[spot_ns.potionNum] ));
	$('#modalFavorite').modal('show');

	return( false );
}

function addFavorite()
{
	spot_ns.potionNum = $(this).attr('data-potion');

	$('#customName' ).prop( 'value', '' );
	$('#customName' ).prop( 'placeholder', 'Custom Potion Name' );

	$('#potionContents').empty();
	$('#addToFav').html('Add to Favorites');
	//$('#potionContents').append( '<p><b>'+	spot_ns.potionNum + '</b></p>' );
	// <input id="customName" type="text" class="span3" placeholder="Custom Potion Name">
	$('#potionContents').append( potionString( spot_ns.gp[spot_ns.potionNum] ));
	$('#modalFavorite').modal('show');

	return( false );
}

// function: merge
// provide a "safe" intersection of two sorted arrays
// http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
function merge(a, b)
{
	// this next line was my own addition
	if( !a ) { return( b ); }

	var ai=0, bi=0, result = new Array();

	while( ai < a.length && bi < b.length )
	{
		if      (a[ai] < b[bi] ){ ai++; }
		else if (a[ai] > b[bi] ){ bi++; }
		else { result.push(a[ai]); ai++; bi++; }
	}

	return result;
}


function potionString ( potion )
{
	return( "<dl><dt>Ingredients :</dt><dd>"
			+ potion["i"].join(', ')
			+ "</dd><dt>Effects :</dt><dd>"
			+ potion["e"].join(', ')
			+ "</dd></dl>" );
}

spot_ns.resetAll = function()
{
	ingScopeFilter = null;
	effScopeFilter = null;

	$( spot_ns.eOptions.selected ).removeClass( 'label label-warning label-info' );
	$( spot_ns.iOptions.selected ).removeClass( 'label label-warning label-info' );

	redraw();
	return( false );
}

spot_ns.selectIngMenu = function()
{
	var hitText = $(this).text();

	switch( true ) {
		case /^Two/.test( hitText ):
			ingScopeFilter = spot_ns.idx.ni[2];
			break;
		case /^Three/.test( hitText ):
			ingScopeFilter = spot_ns.idx.ni[3];
			break;
		case /^Any/.test( hitText ):
			ingScopeFilter = null;
			break;
		default:
			// alert( "You hit a WTF!" );
			break;
	}

	redraw();
	return( true );
}

spot_ns.selectEffMenu = function()
{
	var hitText = $(this).text();

	switch( true ) {
		case /^One/.test( hitText ):
			effScopeFilter = spot_ns.idx.ne[1];
			break;
		case /^Two/.test( hitText ):
			effScopeFilter = spot_ns.idx.ne[2];
			break;
		case /^Three/.test( hitText ):
			effScopeFilter = spot_ns.idx.ne[3];
			break;
		case /^Four/.test( hitText ):
			effScopeFilter = spot_ns.idx.ne[4];
			break;
		case /^Five/.test( hitText ):
			effScopeFilter = spot_ns.idx.ne[5];
			break;
		case /^Any/.test( hitText ):
			effScopeFilter = null;
			break;
		default:
			// alert( "You hit a WTF!" );
			break;
	}

	redraw();
	return( true );
}

}( window.spot_ns = window.spot_ns || {}, jQuery ));


$(document).ready( 
	function() 
	{
		var i;

		for( i in spot_ns.gi ) { spot_ns.allIngredients.push( i ); }
		for( i in spot_ns.ge ) { spot_ns.allEffects.push( i ); }

		spot_ns.display( spot_ns.allIngredients, {}, spot_ns.iOptions );
		spot_ns.display( spot_ns.allEffects    , {}, spot_ns.eOptions );

		//alert( localStorage.getItem( 'spot-favorites' ));
		// need to figure out why this does not work..
		spot_ns.favorites = JSON.parse( localStorage.getItem( 'spot-favorites' ));
		// alert( spot_ns.favorites );
		spot_ns.displayFavorites( spot_ns.favorites );

		$('.dropdown-toggle').dropdown();
		$('.selEff').click( spot_ns.selectEffMenu );
		$('.selIng').click( spot_ns.selectIngMenu );
		$('#reset').click( spot_ns.resetAll );
		$('#addToFav').click( spot_ns.saveFavorite );

	});

// vim:set tabstop=2 shiftwidth=2 noexpandtab:
