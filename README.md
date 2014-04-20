# SPOT

Skyrim Potion Optimizing Tool

[GitHub Hosted POC](http://sammyoos.github.io/SPOT/)

This small app was written to help my kids and some friends with making 
potions in the game Skyrim - and at the time to learn how to write 
mini-web apps for tablets.  Recently we've been playing Skyrim again, 
and I realized the app was incredibly useful for potion creating and 
it was incredibly ugly. (Hey it's looking better now...)

Hopefully I can make it more appealing while still retaining the usefulness.

## Technical Note:

The jQuery and Bootstrap libraries are stored locally so that the app can be
run without a network connection if installed on a phone or tablet.

## Known Issue List

1. Switching to portrait mode on most tablets still looks quite bad.
1.  When you filter by a # of ingredients or effects that 
	do not exist in the current potion list, the potion list returns
	an empty list (which is OK), going back to the filter and expanding
	the filter expression shows all of the ingredients and effects and
	previous selections are deselected.


## Todo List:

1. add sorting for:
	* value of potion
	* profit for potion
	* efficiency of ingredient use
	* potency of effects
1. phone display support

