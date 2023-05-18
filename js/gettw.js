var $ = go.GraphObject.make;

// Diagrama que recibirá los nodos y enlaces
var diagram = $(go.Diagram, "divDiagram",
	{
		"grid.visible": false,
		"draggingTool.dragsLink": true,
		"draggingTool.isGridSnapEnabled": true,
		"linkingTool.isUnconnectedLinkValid": true,
		"linkingTool.portGravity": 10,
		"relinkingTool.isUnconnectedLinkValid": true,
		"relinkingTool.portGravity": 10,
		"relinkingTool.fromHandleArchetype":
			$(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(10, 10), fill: "tomato", stroke: "darkred" }),
		"relinkingTool.toHandleArchetype":
			$(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(10, 10), fill: "darkred", stroke: "tomato" }),
		"linkReshapingTool.handleArchetype":
			$(go.Shape, "Diamond", { desiredSize: new go.Size(10, 10), fill: "lightblue", stroke: "deepskyblue" }),
		"rotatingTool.handleAngle": 270,
		"rotatingTool.handleDistance": 30,
		"rotatingTool.snapAngleMultiple": 15,
		"rotatingTool.snapAngleEpsilon": 15,
		"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
		"allowDrop": true,
		"undoManager.isEnabled": true,
		"grid.background": "white"
	});

// Función para crear un "puerto", indicando que el nodo puede ser enlazado con otros nodos
function createPort(nombre, spot, salida, entrada) {
	return $(go.Shape, "Circle",
		{
			fill: null,  // no visto por defecto
			stroke: null, // sin borde
			desiredSize: new go.Size(10, 10),
			alignment: spot,  // alinea respecto a la forma
			alignmentFocus: spot,  // dentro de la forma
			portId: nombre, // id - nombre del "puerto"
			fromSpot: spot, toSpot: spot,  // declara donde se pueden declarar enlaces
			fromLinkable: salida, toLinkable: entrada,  // declara si el usuario puede dibujar enlaces hacia/desde él
			cursor: "pointer"  // muestra el cursor para indicar que es un posible punto de enlace
		});
}
	
// Función para mostrar/ocultar los "puertos"
function showPorts(nodo, mostrar) {
	nodo.ports.each(function(port) {
		if (port.portId !== "") {  // no cambiar el puerto por defecto
			port.fill = mostrar ? "rgba(0,0,0,.3)" : null;
		}
	});
}

// Plantilla para selección de nodo
var nodeSelectionTemplate =
$(go.Adornment, "Auto",
	$(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
	$(go.Placeholder)
);
	
// Plantilla para redimensión de nodo
var nodeRedimensionTemplate =
$(go.Adornment, "Spot",
	{ locationSpot: go.Spot.Right },
	$(go.Placeholder),
	$(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" })
);
	
// Plantilla para rotación de nodo
var nodeRotationTemplate =
$(go.Adornment,
	{ locationSpot: go.Spot.Center, locationObjectName: "ELLIPSE" },
	$(go.Shape, "Ellipse", { name: "ELLIPSE", cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "lightblue", stroke: "deepskyblue" }),
	$(go.Shape, { geometryString: "M3.5 7 L3.5 30", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
);
	
	
// Plantilla Nodo: Forma + texto
var nodeTemplate_shape =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	new go.Binding("angle").makeTwoWay(),
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	{ resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Auto",
		{ name: "PANEL" },
		new go.Binding("desiredSize", "shapeSize", go.Size.parse).makeTwoWay(go.Size.stringify),
		$(go.Shape, "Rectangle",
			{
				portId: "", // puerto por defecto: si no hay lugar en los datos del enlace, se usa el lado más cercano
				fromLinkable: false, 
				toLinkable: false, 
				cursor: "grab",
				fill: "white",
				strokeWidth: 2,
				stretch: go.GraphObject.Fill
			},
			new go.Binding("figure"),
			new go.Binding("fill"),
			new go.Binding("strokeWidth"),
			new go.Binding("width"),
			new go.Binding("height")
		),
		$(go.TextBlock,
			{
				font: "16pt Roboto, sans-serif, Arial, Helvetica",
				margin: 20,
				cursor: "grab",
				wrap: go.TextBlock.WrapFit,
				editable: true
			},
			new go.Binding("font"),
			new go.Binding("editable"),
			new go.Binding("text").makeTwoWay()
		)
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);


// Plantilla Nodo: Forma + texto y superindex
var nodeTemplate_shapeTextSup =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	{ resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Auto",
		{ name: "PANEL" },
		new go.Binding("desiredSize", "shapeSize", go.Size.parse).makeTwoWay(go.Size.stringify),
		$(go.Shape, "Rectangle",
			{
				portId: "",
				fromLinkable: false, 
				toLinkable: false, 
				cursor: "grab",
				fill: "white",
				strokeWidth: 2,
				stretch: go.GraphObject.Fill
			},
			new go.Binding("figure"),
			new go.Binding("fill"),
			new go.Binding("strokeWidth"),
			new go.Binding("width"),
			new go.Binding("height")
		),
		$(go.Panel, "Horizontal",
			$(go.TextBlock,
				{
					font: "16pt Roboto, sans-serif, Arial, Helvetica",
					margin: 20,
					minSize: new go.Size(5, 30),
					wrap: go.TextBlock.WrapFit,
					editable: true,
					verticalAlignment: go.Spot.Center,
					margin: 1,
					cursor: "grab",
					text: "e"
				},
				new go.Binding("text").makeTwoWay()
			),
			$(go.TextBlock, // superindice
				{
					font: "12pt Roboto, sans-serif, Arial, Helvetica",
					margin: 4,
					minSize: new go.Size(5, 30),
					wrap: go.TextBlock.WrapFit,
					editable: true,
					verticalAlignment: go.Spot.Top,
					cursor: "grab",
					text: "x"
				},
				new go.Binding("text", "superindex").makeTwoWay()
			)
		),
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Plantilla Nodo: Forma + texto y subindex
var nodeTemplate_shapeTextSub =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	{ resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Auto",
		{ name: "PANEL" },
		new go.Binding("desiredSize", "shapeSize", go.Size.parse).makeTwoWay(go.Size.stringify),
		$(go.Shape, "Rectangle",
			{
				portId: "",
				fromLinkable: false, 
				toLinkable: false, 
				cursor: "grab",
				fill: "white",
				strokeWidth: 2,
				stretch: go.GraphObject.Fill
			},
			new go.Binding("figure"),
			new go.Binding("fill"),
			new go.Binding("strokeWidth"),
			new go.Binding("width"),
			new go.Binding("height")
		),
		$(go.Panel, "Horizontal",
			$(go.TextBlock,
				{
					font: "16pt Roboto, sans-serif, Arial, Helvetica",
					margin: 20,
					minSize: new go.Size(5, 30),
					wrap: go.TextBlock.WrapFit,
					editable: true,
					verticalAlignment: go.Spot.Center,
					margin: 1,
					cursor: "grab",
					text: "e"
				},
				new go.Binding("text").makeTwoWay()
			),
			$(go.TextBlock, // superindice
				{
					font: "12pt Roboto, sans-serif, Arial, Helvetica",
					margin: 4,
					minSize: new go.Size(5, 30),
					wrap: go.TextBlock.WrapFit,
					editable: true,
					verticalAlignment: go.Spot.Bottom,
					cursor: "grab",
					text: "x"
				},
				new go.Binding("text", "superindex").makeTwoWay()
			)
		),
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Plantilla Nodo: Figura
var nodeTemplate_picture =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	{ resizable: true, resizeObjectName: "FIGURA", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Vertical",
		$(go.Picture,
			{
				name: "FIGURA",
				width: 64,
				height: 64,
				imageStretch: go.GraphObject.Fill,
				cursor: "grab",
				margin: 2,
				
			},
			new go.Binding("source"),
			new go.Binding("width").makeTwoWay(),
			new go.Binding("height").makeTwoWay()
		),
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Plantilla Nodo: Figura + Texto debajo
var nodeTemplate_pictureText =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), // importante para replicar la información a través del servidor
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	{ resizable: true, resizeObjectName: "FIGURA_TEXTO", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Vertical",
		$(go.Picture,
			{
				name: "FIGURA_TEXTO",
				width: 64,
				height: 64,
				imageStretch: go.GraphObject.Fill,
				cursor: "grab",
				margin: 2,
				
			},
			new go.Binding("source"),
			new go.Binding("width").makeTwoWay(),
			new go.Binding("height").makeTwoWay()
		),
		$(go.TextBlock,
			{
				font: "16pt Roboto, sans-serif, Arial, Helvetica",
				margin: 2,
				cursor: "grab",
				wrap: go.TextBlock.WrapFit,
				editable: true
			},
			new go.Binding("text").makeTwoWay()
		)
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Plantilla Nodo: Texto
var nodeTemplate_textblock =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	// { resizable: true, resizeObjectName: "TEXTO", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Vertical",
		$(go.TextBlock,
			{
				font: "16pt Roboto, sans-serif, Arial, Helvetica",
				margin: 20,
				cursor: "grab",
				wrap: go.TextBlock.WrapFit,
				editable: true,
				text: "Text"
			},
			new go.Binding("text").makeTwoWay()
		)
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Plantilla Nodo: Texto con subindice
var nodeTemplate_textblockSubindex =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), // importante para replicar la información a través del servidor
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	// { resizable: true, resizeObjectName: "TEXTO", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Horizontal",
		$(go.TextBlock, 
			{
				font: "16pt Roboto, sans-serif, Arial, Helvetica",
				margin: 20,
				minSize: new go.Size(5, 30),
				wrap: go.TextBlock.WrapFit,
				editable: true,
				verticalAlignment: go.Spot.Center,
				margin: 1,
				cursor: "grab",
				text: "e"
			},
			new go.Binding("text").makeTwoWay()
		),
		$(go.TextBlock, // subindice
			{
				font: "12pt Roboto, sans-serif, Arial, Helvetica",
				margin: 4,
				minSize: new go.Size(5, 30),
				wrap: go.TextBlock.WrapFit,
				editable: true,
				verticalAlignment: go.Spot.Bottom,
				text: "x",
				cursor: "grab"
			},
			new go.Binding("text", "subindex").makeTwoWay()
		)
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Plantilla Nodo: Texto con superindice
var nodeTemplate_textblockSuperindex =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	// { resizable: true, resizeObjectName: "TEXTO", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Horizontal",
		$(go.TextBlock,
			{
				font: "16pt Roboto, sans-serif, Arial, Helvetica",
				margin: 20,
				minSize: new go.Size(5, 30),
				wrap: go.TextBlock.WrapFit,
				editable: true,
				verticalAlignment: go.Spot.Center,
				margin: 1,
				cursor: "grab",
				text: "e"
			},
			new go.Binding("text").makeTwoWay()
		),
		$(go.TextBlock, // superindice
			{
				font: "12pt Roboto, sans-serif, Arial, Helvetica",
				margin: 4,
				minSize: new go.Size(5, 30),
				wrap: go.TextBlock.WrapFit,
				editable: true,
				verticalAlignment: go.Spot.Top,
				cursor: "grab",
				text: "x"
			},
			new go.Binding("text", "superindex").makeTwoWay()
		)
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Plantilla Nodo: Texto con sub y super indices
var nodeTemplate_textblockSubSuperindexes =
$(go.Node, "Spot",
	{ locationSpot: go.Spot.Center },
	new go.Binding("angle").makeTwoWay(),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	{ selectable: true, selectionAdornmentTemplate: nodeSelectionTemplate },
	// { resizable: true, resizeObjectName: "TEXTO", resizeAdornmentTemplate: nodeRedimensionTemplate },
	{ rotatable: true, rotateAdornmentTemplate: nodeRotationTemplate },
	$(go.Panel, "Horizontal",
		$(go.TextBlock,
			{
				font: "16pt Roboto, sans-serif, Arial, Helvetica",
				margin: 20,
				minSize: new go.Size(5, 40),
				wrap: go.TextBlock.WrapFit,
				editable: true,
				verticalAlignment: go.Spot.Center,
				margin: 1,
				cursor: "grab",
				text: "e"
			},
			new go.Binding("text").makeTwoWay()
		),
		$(go.Panel, "Vertical",
			$(go.TextBlock, // superindice
				{
					font: "12pt Roboto, sans-serif, Arial, Helvetica",
					margin: 2,
					minSize: new go.Size(5, 5),
					wrap: go.TextBlock.WrapFit,
					editable: true,
					verticalAlignment: go.Spot.Top,
					cursor: "grab",
					text: "x"
				},
				new go.Binding("text", "superindex").makeTwoWay()
			),
			$(go.TextBlock, // subindice
				{
					font: "12pt Roboto, sans-serif, Arial, Helvetica",
					margin: 2,
					minSize: new go.Size(5, 5),
					wrap: go.TextBlock.WrapFit,
					editable: true,
					verticalAlignment: go.Spot.Top,
					cursor: "grab",
					text: "y"
				},
				new go.Binding("text", "subindex").makeTwoWay()
			)
		),
	),
	// cuatro pequeños "puertos", uno para cada lado del nodo
	createPort("T", go.Spot.Top, false, true),
	createPort("L", go.Spot.Left, true, true),
	createPort("R", go.Spot.Right, true, true),
	createPort("B", go.Spot.Bottom, true, false),
	{ // se asocia los eventos entrar/salir para mostrar/ocultar dichos "puertos"
		mouseEnter: function(e, nodo) { showPorts(nodo, true); },
		mouseLeave: function(e, nodo) { showPorts(nodo, false); }
	}
);

// Como se hace uso de diferentes plantillas de nodos es necesario guardarlas y asociarlas al diagrama
var nodesTemplates = new go.Map();
nodesTemplates.add("shape", nodeTemplate_shape);
nodesTemplates.add("shape_textSup", nodeTemplate_shapeTextSup);
nodesTemplates.add("shape_textSub", nodeTemplate_shapeTextSub);
nodesTemplates.add("picture", nodeTemplate_picture);
nodesTemplates.add("picture_text", nodeTemplate_pictureText);
nodesTemplates.add("textblock", nodeTemplate_textblock);
nodesTemplates.add("textblock_superindex", nodeTemplate_textblockSuperindex);
nodesTemplates.add("textblock_subindex", nodeTemplate_textblockSubindex);
nodesTemplates.add("textblock_subsuperindexes", nodeTemplate_textblockSubSuperindexes);
diagram.nodeTemplateMap = nodesTemplates;


// Plantilla seleccion enlace
var plantillaSeleccionEnlace =
$(go.Adornment, "Link",
	$(go.Shape,
	{ isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })
);

// Plantilla Enlace: Doble flecha
var linksTemplate =
$(go.Link,
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	{ selectable: true, selectionAdornmentTemplate: plantillaSeleccionEnlace },
	{ relinkableFrom: true, relinkableTo: true, reshapable: true },
	{
		routing: go.Link.Orthogonal,
		curve: go.Link.JumpOver,
		corner: 5,
		toShortLength: 4
	},
	new go.Binding("points").makeTwoWay(),
	$(go.Shape, // la forma de la línea
		{ isPanelMain: true },
		new go.Binding("stroke", "linkStrokeColor"),
	new go.Binding("strokeWidth", "linkStrokeWidth")),
	$(go.Shape,  // la forma de la flecha origen
		new go.Binding("fromArrow", "fromArrowShape"),
		new go.Binding("stroke", "fromArrowStrokeColor"),
		new go.Binding("fill", "fromArrowColor"),
	new go.Binding("strokeWidth", "fromArrowStrokeWidth")),
	$(go.Shape,  // la forma de la flecha destino
		new go.Binding("toArrow", "toArrowShape"),
		new go.Binding("stroke", "toArrowStrokeColor"),
		new go.Binding("fill", "toArrowColor"),
	new go.Binding("strokeWidth", "toArrowStrokeWidth")),
	$(go.Panel, "Auto",
		//new go.Binding("visible", "isSelected").ofObject(),
		$(go.Shape, "RoundedRectangle",  // la forma del texto del enlace
		{ fill: "transparent", stroke: null,
			cursor: "grab" }),
		$(go.TextBlock, // texto del enlace, editable
			{
				textAlign: "center",
				cursor: "grab",
				font: "10pt Roboto, sans-serif, Arial, Helvetica",
				stroke: "#919191",
				margin: 4,
				minSize: new go.Size(10, NaN),
				editable: true
			},
		new go.Binding("text").makeTwoWay())
	)
);

// Como se hace uso de diferentes plantillas de enlaces es necesario guardarlas y asociarlas al diagrama
var linksTemplates = new go.Map();
// plantillasEnlaces.add("unaFlecha", plantillaEnlaceUnaFlecha);
linksTemplates.add("link", linksTemplate);
diagram.linkTemplateMap = linksTemplates;

// El modelo del diagrama se encuentra vacío inicialmente
diagram.model = $(go.GraphLinksModel,
{
	linkKeyProperty: "key", // importante para poder compartir la información en un GraphLinksModel
	nodeDataArray: [],
	linkDataArray: []
});

// Creación de las paletas atendiendo a dimensiones de pantalla
if (window.screen.width > 2560) {
	createPalettes(256);
} else if (window.screen.width < 1024) {
	createPalettes(64);
} else {
	createPalettes(128);
}

function createPalettes(nodeSize) {
	var paletteNodes =
	$(go.Palette, "divNodesPalette",
		{
			maxSelectionCount: 1,
			nodeTemplateMap: diagram.nodeTemplateMap,  // se asocian las plantillas de los nodos
			linkTemplateMap: diagram.linkTemplateMap,	// se asocian las plantillas de los enlaces
			model: new go.GraphLinksModel([  // contenidos de la paleta
					// nodos
					// { text: "Picture", source: "file:///C:/Users/YoelA/OneDrive/Escritorio/Pictos_QueHacemosHoy/Bañarse.png", desiredSize: new go.Size(128, 128), category: "picture" },
					{ text: "Entity", figure: "Rectangle", fill: "lightskyblue", font: "16pt Roboto, sans-serif, Arial, Helvetica", editable: false, category: "shape" },
					{ text: "Relation", figure: "Diamond", fill: "lightskyblue",  category: "shape_textSup" },
					{ text: "Attribute", figure: "Ellipse", fill: "lightskyblue", category: "shape" },
					{ text: "", source: "images/Comprar.png", width: nodeSize, height: nodeSize, category: "picture" },
					{ text: "Text", source: "images/Bañarse.png", width: nodeSize, height: nodeSize, category: "picture_text" },
					{ text: "Text", category: "textblock" },
					{ text: "Formulae", subindex: "sub", category: "textblock_subindex" },
					{ text: "Formulae", superindex: "sup", category: "textblock_superindex" },
					{ text: "Formulae", superindex: "sup", subindex: "sub", category: "textblock_subsuperindexes" },
				], [ 
					// enlaces 
				]
			)
		}
	);

	var paletteLinks =
	$(go.Palette, "divLinksPalette",
		{
			maxSelectionCount: 1,
			nodeTemplateMap: diagram.nodeTemplateMap,  // se asocian las plantillas de los nodos
			linkTemplateMap: diagram.linkTemplateMap,	// se asocian las plantillas de los enlaces
			model: new go.GraphLinksModel([  // contenidos de la paleta
						//nodos
				], [ 	// enlaces 
					{ points: new go.List().addAll([new go.Point(-30, 30), new go.Point(30, -30)]), linkStrokeColor: "black", linkStrokeWidth: "2", 
						fromArrowShape: "", fromArrowColor: "black", fromArrowStrokeColor: "black", fromArrowStrokeWidth: "2", 
						toArrowShape: "", toArrowColor: "white", toArrowStrokeWidth: "2", category: "link" },
					{ points: new go.List().addAll([new go.Point(-30, 30), new go.Point(30, -30)]), linkStrokeColor: "black", linkStrokeWidth: "2", 
						fromArrowShape: "", fromArrowColor: "black", fromArrowStrokeColor: "black", fromArrowStrokeWidth: "2", 
						toArrowShape: "Line", toArrowColor: "white", toArrowStrokeWidth: "2", category: "link" },
					{ points: new go.List().addAll([new go.Point(-30, 30), new go.Point(30, -30)]), linkStrokeColor: "black", linkStrokeWidth: "2", 
						fromArrowShape: "", fromArrowColor: "black", fromArrowStrokeColor: "black", fromArrowStrokeWidth: "2", 
						toArrowShape: "LineCircle", toArrowColor: "white", toArrowStrokeWidth: "2", category: "link" },
					{ points: new go.List().addAll([new go.Point(-30, 30), new go.Point(30, -30)]), linkStrokeColor: "black", linkStrokeWidth: "2", 
						fromArrowShape: "", fromArrowColor: "black", fromArrowStrokeColor: "black", fromArrowStrokeWidth: "2", 
						toArrowShape: "DoubleLine", toArrowColor: "white", toArrowStrokeWidth: "2", category: "link" },
					{ points: new go.List().addAll([new go.Point(-30, 30), new go.Point(30, -30)]), linkStrokeColor: "black", linkStrokeWidth: "2", 
						fromArrowShape: "", fromArrowColor: "black", fromArrowStrokeColor: "black", fromArrowStrokeWidth: "2", 
						toArrowShape: "Fork", toArrowColor: "white", toArrowStrokeWidth: "2", category: "link" },
					{ points: new go.List().addAll([new go.Point(-30, 30), new go.Point(30, -30)]), linkStrokeColor: "black", linkStrokeWidth: "2", 
						fromArrowShape: "", fromArrowColor: "black", fromArrowStrokeColor: "black", fromArrowStrokeWidth: "2", 
						toArrowShape: "CircleFork", toArrowColor: "white", toArrowStrokeWidth: "2", category: "link" },
					{ points: new go.List().addAll([new go.Point(-30, 30), new go.Point(30, -30)]), linkStrokeColor: "black", linkStrokeWidth: "2", 
						fromArrowShape: "", fromArrowColor: "black", fromArrowStrokeColor: "black", fromArrowStrokeWidth: "2", 
						toArrowShape: "LineFork", toArrowColor: "white", toArrowStrokeWidth: "2", category: "link" },
				]
			)
		}
	);
}

/***
	COMUNICACIÓN CLIENTE-SERVIDOR
		--- TOGETHERJS ---
***/
diagram.model.addChangedListener(function(e) {
	if (e.isTransactionFinished) {
		var json = e.model.toIncrementalJson(e);
		
		if (TogetherJS.running) {
			TogetherJS.send({
				type: "content-send",
				output: json
			});
			console.log(json)
		}
	}
});

TogetherJS.hub.on("content-send", function(msg) {
	if (!msg.sameUrl) {
		return;
	}
	diagram.model.applyIncrementalJson(msg.output);
	//diagram.layoutDiagram(true);
	//diagram.isModified = false;
	console.log(msg.output);
});