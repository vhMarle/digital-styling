Key Technical & UI Specifications
•	App Architecture & Category: Wardrobe inventory/digital closet application 
•	Layout Structure:
o	Top Navigation Bar: Features a back button arrow, screen title ("All clothes"), and an overflow menu (three vertical dots). 
o	Search & Filter Component: A full-width search input bar ("Search dress, shoe, etc. ") paired with a left-aligned filter icon button. 
o	Horizontal Scroll Category Tabs: Scrollable sub-category selector (All, Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories) with an active state indicator bar under "All". 
o	Horizontal Carousel Section: A dedicated top section labeled "Recently Added" containing squircle-cropped, thumbnail-style previews of sub categories.  If Tops sub category are selected then the tumbnail should be below the sub-sub-category of:  Sleeveless, Short Sleeve, ¾ Sleeve, Long. If shoes sub category were selected above, then the tumbnail should be below the sub-sub-categories of Boots, Sandals, Flats, heels. For Accessories then the tumbnail should be below the sub-sub-category of Bags, Belts, Jewelry, Scarfs.
o	Main Content Grid: A 3-column responsive image grid displaying isolated garment items with background removal, light gray grid dividers, and floating "+" add/action targets on the bottom-left of each grid cell. When “+” are selected, the image should pop out with all details captured when item was added/loaded as well as an edit and delete button.
o	Bottom Navigation Bar: A 5-tab fixed navigation bar with vector line icons and text labels (Home [active], Outfits, + [center CTA/action button], Feed, Inbox). 
o	Utility Controls: A circular "Back-to-top" floating action button (FAB) overlaid on the lower-right side of the grid. 
Design System & Visual Style
•	Color Palette: High-contrast, minimal light theme featuring a pure white background, dark charcoal body text/icons, light gray surface fills for input fields/cards, and subtle grid borders. 
•	Typography: Clean, sans-serif typography (similar to San Francisco or Inter) with distinct hierarchy across screen titles, input placeholders, and navigation labels. 
•	Image Assets: Isolated PNG format product images with background segmentation/alpha transparency, ensuring consistent alignment on neutral backgrounds. 




Functionality
•	When “+” are selected a new item should be imported into the DB.
•	Method of import will have options for:
o	Add from URL (gather info on 
	Site Name
	Brand
	Inventory Type
	Inventory Sub-types
	Color
	Size)
o	Browse
o	Copy & Paste
o	Drag & Drop
•	All of the above will be displayed before the option to save or edit will be presented
•	Once save button clicked, the item will be saved into the db.

•	On import all necessary details should be gather for the sub categories
•	Main Headers:
o	New Item
	Import from URL, Browse, Drag & Drop
	If imported from URL then the following information should be pulled from the website:  Site name / Brand, Color, Size, Style
	All background needs to be removed to have a clear image of the item
o	Inventory
	Tops
	Bottoms
	Shoes
	Boots
	Sandals
	Flats
	Heels
	Dresses
	Bags
	Accessories
	Bag
	Belt
	Jewellery
	Scarf
o	Outfits
o	New Outfits

