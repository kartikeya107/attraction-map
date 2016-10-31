         var map;
         var ajaxRequest;
         var plotlist;
         var plotlayers = [];
         var liGraph = {};
         var touristPlaces = new Array();
         var gnodes = {};
         var ways = {};
         var relations = {};
         var gways = {};
         var firstLatLng;
         var secLatLng;
         var clickTimes = 0;

         function onMapClick(e) {
             console.log(e);
             if (clickTimes % 2 == 0) {
                 firstLatLng = e.latlng;
             } else {
                 try {
                     map.removeLayer(map._layers[map._layers.length - 1]);
                 } catch (e) {}
                 secLatLng = e.latlng;
                 var nearestFirstNode = findNearestInGraph(firstLatLng);
                 var nearestSecondNode = findNearestInGraph(secLatLng);
                 console.log(nearestFirstNode);
                 console.log(nearestSecondNode);
                 astar(nearestFirstNode, nearestSecondNode);
                 /*var control = L.Routing.control({
           waypoints: [
             firstLatLng,
             secLatLng
           ]
         }).addTo(map);
         	console.log("Control--");
         		console.log(control);*/
             }
             clickTimes++;
         }

         function initmap(minLat, minLon) {
             // set up the map
             map = new L.Map('map');
             /*
             	// create the tile layer with correct attribution
             	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
             	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
             	var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib});		
         
             	// start the map in South-East England
             	map.setView(new L.LatLng(minLat, minLon),18);
             	map.addLayer(osm);*/
             new L.OSM.Mapnik().addTo(map);

             $.ajax({
                 url: "map1.osm",
                 // or "http://www.openstreetmap.org/api/0.6/way/52477381/full"
                 dataType: "xml",
                 success: function(xml) {
                     var layer = new L.OSM.DataLayer(xml).addTo(map);
                     map.fitBounds(layer.getBounds());
                     //parseXml(xml);
                     gnodes = getNodes(xml);
                     setTouristPlaces(gnodes);
                     //console.log(nodes.length);
                     ways = getWays(xml, gnodes);
                     relations = getRelations(xml, gnodes, ways);
                     //console.log(relations);
                     //console.log(ways.length);
                     //var relations = getRelations(xml, nodes, ways);
                     //console.log(relations);
                     var totalPlaces = 0;
                     var totalNodes = 0;
                     /*for(var i=0;i<ways.length;i++) {
                     	var way = ways[i];
                     	//var tags = way.tags;
                     	var nodes = way.nodes;
                     	//console.log(nodes);
                     	
                     	/*for(var j=0;j<nodes.length;j++){
                     	//console.log(nodes[j].tags);
                     	var tags = nodes[j].tags;
                     		for(var k in tags) {
                     		var key = k;
                     		var value = tags[k];
                     		//console.log("Key-"+key+", value-"+value);
                     		if(key=="tourism" || key=="attraction" || key=="leisure" || key=="natural" || value=="tourism" || value=="attraction" || value=="leisure" || value=="natural") {
                     			//console.log(nodes[j]);
                     			totalPlaces++;
                     		}
                     	}
                     	}*/
                     /*
                              		for(var j=0;j<nodes.length-1;j++){
                              			var node = nodes[j];
                              			var nextNode = nodes[j+1];
                              			var nodeId = node.id;
                              			var nextNodeId = nextNode.id;
                              			if(!(liGraph[nodeId])) {
                              				liGraph[nodeId] = new Array();
                              				totalNodes++;
                              			}
                              			if(!(nextNodeId in liGraph)) {
                              				liGraph[nextNodeId] = new Array();
                              				totalNodes++;
                              			}
                              			liGraph[nodeId].push(nextNodeId);
                              			liGraph[nextNodeId].push(nodeId);
                              		}
                              		/*
                              		for(var j=0;j<tags.length;j++) {
                              			var key = tags[i].k;
                              			var value = tags[i].v;
                              			if(key=="tourism" || key=="attraction" || key=="leisure" || key=="natural" || value=="tourism" || value=="attraction" || value=="leisure" || value=="natural") {
                              				console.log(way);
                              			}
                              		}*/
                     //}

                     //console.log(totalNodes);
                     createGraph();
                     map.on('click', onMapClick);
                 }

             });
         }

         //var mymap = L.map('map').setView([51.505, -0.09], 13);
         initmap();
         /*
         $(document).ready(function()
         {
         $.ajax({
         type: "GET",
         url: "map.osm",
         dataType: "xml",
         success: parseXml
         });
         });
         */
         var parseXml = function(xml) {
             //console.log(xml);
             /*var minLat = $(xml).find("bounds").each(function(){
             	//console.log($(this));
             	var minLat = $(this).attr("minlat");
             	var maxLat = $(this).attr("maxlat");
             	var minLon = $(this).attr("minlon");
             	var maxLon = $(this).attr("maxlon");
             	//console.log(minLat);
             	//console.log(minLon);
             	//initmap(maxLat, maxLon);
             	return minLat;
             });
             va ways = $(xml).find("way");
             console.log(ways[0]);
             /
             $(xml).find("way").each(function(){
             	this.lat = $(this).attr("lat");
             	this.lon = $(this).attr("lon");
             	var node = this;
             	/*$(this).find("tag").each(function(i){
             		var key = $(this).attr("k");
             		var value = $(this).attr("v");
             		if(key=="tourism" || key=="attraction" || key=="leisure" || key=="natural" || value=="tourism" || value=="attraction" || value=="leisure" || value=="natural") {
             			L.marker([node.lat,node.lon]).addTo(map);
             		}
             	});
             	*/
             /*console.log($(this));
      	var id = $(this).attr("id");
      	
      	//L.marker([$(this).find("lat").text(),$(this).find("lon").text()]).addTo(map);
      	
      });*/
             //console.log(minLat);
         }

         var getNodes = function(xml) {
             var result = {};

             var nodes = xml.getElementsByTagName("node");
             //console.log(nodes);
             for (var i = 0; i < nodes.length; i++) {
                 var node = nodes[i],
                     id = node.getAttribute("id");
                 result[id] = {
                     id: id,
                     type: "node",
                     latLng: L.latLng(node.getAttribute("lat"),
                         node.getAttribute("lon"),
                         true),
                     tags: this.getTags(node)
                 };
             }

             return result;
         }

         var getTags = function(xml) {
             var result = {};

             var tags = xml.getElementsByTagName("tag");
             for (var j = 0; j < tags.length; j++) {
                 result[tags[j].getAttribute("k")] = tags[j].getAttribute("v");
             }

             return result;
         }
         var getWays = function(xml, nodes) {
             var result = [];

             var ways = xml.getElementsByTagName("way");
             for (var i = 0; i < ways.length; i++) {
                 var way = ways[i],
                     nds = way.getElementsByTagName("nd");
                 //console.log(nds);
                 var way_object = {
                     id: way.getAttribute("id"),
                     type: "way",
                     nodes: new Array(nds.length),
                     tags: this.getTags(way)
                 };

                 for (var j = 0; j < nds.length; j++) {
                     way_object.nodes[j] = nodes[nds[j].getAttribute("ref")];
                 }

                 result.push(way_object);
                 gways[way_object.id] = way_object;
             }

             return result;
         }

         var getRelations = function(xml, nodes, ways) {
             var result = [];

             var rels = xml.getElementsByTagName("relation");
             //console.log(rels);
             var stopNodes = 0;
             var numRoutes = 0;
             for (var i = 0; i < rels.length; i++) {
                 var rel = rels[i],
                     members = rel.getElementsByTagName("member");
                 var tags = getTags(rel);
                 //console.log(tags);
                 if (tags.type == "route") {
                     numRoutes++;
                     var rel_object = {
                         id: rel.getAttribute("id"),
                         type: "relation",
                         members: new Array(members.length),
                         tags: this.getTags(rel)
                     };

                     for (var j = 0; j < members.length; j++) {
                         /*if (members[j].getAttribute("type") === "node") {
                rel_object.members[j] = gnodes[members[j].getAttribute("ref")];
      		  stopNodes++;
      		  }
      		else */
                         if (members[j].getAttribute("type") === "way") {
                             if (members[j].getAttribute("ref") in gways) {
                                 var way = gways[members[j].getAttribute("ref")];
                                 way.type = "way";
                                 rel_object.members.push(way);
                                 //showWayById(gways[members[j].getAttribute("ref")].id);
                             }
                         } else { // relation-way and relation-relation membership not implemented
                             //rel_object.members[j] = null;
                             if (members[j].getAttribute("ref") in gnodes) {
                                 var node = gnodes[members[j].getAttribute("ref")];
                                 node.type = "node";
                                 rel_object.members.push(node);
                                 stopNodes++;
                                 //console.log(members[j]);
                             }
                         }
                     }

                     result.push(rel_object);
                     //if(numRoutes>0)break;
                 }
             }
             //console.log("StopNdodes-"+stopNodes);
             return result;
         }

         var setTouristPlaces = function(nodes) {
             for (var j in nodes) {
                 var tags = nodes[j].tags;
                 for (var k in tags) {
                     var key = k;
                     var value = tags[k];
                     //console.log("Key-"+key+", value-"+value);
                     if (key == "tourism" || key == "attraction" || key == "leisure" || key == "natural" || value == "tourism" || value == "attraction" || value == "leisure" || value == "natural") {
                         //console.log(nodes[j]);
                         //totalPlaces++;
                         touristPlaces.push(j);
                         var point = L.marker([nodes[j].latLng.lat, nodes[j].latLng.lng]).addTo(map);
                         point.bindPopup(value);
                         //console.log(nodes[j].id);
                     }
                 }
             }
             console.log(touristPlaces);
         }

         var heuristic = function(nodeId, destId) {
             //console.log(gnodes);
             var curNode = gnodes[nodeId];
             var destNode = gnodes[destId];

             //console.log(curNode);
             //console.log(destNode);
             var edtHeu = editDistance(curNode, destNode);
             var lowestEdtTourist = 99999999.99;
             for (var j = 0; j < touristPlaces.length; j++) {

                 var dist = editDistance(curNode, gnodes[touristPlaces[j]]);
                 if (dist < lowestEdtTourist) {
                     lowestEdtTourist = dist;
                 }
             }
             return edtHeu + lowestEdtTourist * 5;
         }

         var editDistance = function(curNode, destNode) {
             var edtDist = (curNode.latLng.lat - destNode.latLng.lat) * (curNode.latLng.lat - destNode.latLng.lat) + (curNode.latLng.lng - destNode.latLng.lng) * (curNode.latLng.lng - destNode.latLng.lng);
             return edtDist;
         }

         var compareNodes = function(a, b) {
             return a.priority = b.priority;
         }

         var astar = function(startNode, goalNode) {
             var queue = new PriorityQueue({
                 comparator: compareNodes
             });
             startNode.priority = 0;
             queue.queue(startNode);
             var cameFrom = {};
             var costSoFar = {};
             cameFrom[startNode.id] = 0;
             costSoFar[startNode.id] = 0;
             var goalFound = 0;

             while (queue.length > 0) {
                 var curNode = queue.dequeue();
                 console.log(curNode.priority);
                 if (curNode.id == goalNode.id) {
                     console.log("Goal found");
                     goalFound = 1;
                     break;

                 }
                 var nIds = liGraph[curNode.id];
                 if (!nIds) {
                     console.log("Node is not on any way");
                     break;
                 }
                 //console.log(curNode+"----->");
                 //console.log(nIds);
                 for (var i = 0; i < nIds.length; i++) {
                     var nNode = gnodes[nIds[i]];
                     var newCost = costSoFar[curNode.id] + editDistance(curNode, nNode);
                     if (!(nNode.id in costSoFar) || costSoFar[nNode.id] > newCost) {
                         costSoFar[nNode.id] = newCost;
                         var priority = newCost + heuristic(nNode.id, goalNode.id);
                         nNode.priority = priority;
                         queue.queue(nNode);
                         cameFrom[nNode.id] = curNode.id;
                     }
                 }
             }
             console.log(cameFrom);
             var latLngPath = new Array();
			 latLngPath.push(firstLatLng);
             if (goalFound == 1) {
                 var curId = goalNode.id;
                 while (curId != 0) {

                     var curNode = gnodes[curId];
                     console.log(curNode.latLng);
                     latLngPath.push(new Array(curNode.latLng.lat, gnodes[curId].latLng.lng));
                     //var point = L.marker(curNode.latLng).addTo(map);
                     curId = cameFrom[curId];
                 }
				 latLngPath.push(secLatLng);
                 console.log(latLngPath);
                 //var polygon = L.polygon(latLngPath).addTo(map);
                 //polygon.bindPopup("I am shortest route");
                 //polygon.setStyle({fillColor: '#f37f37'});
                 //for(var i=0;i<latLngPath.length-1;i++) {
                 var polyline = L.polyline(latLngPath, {
                     color: 'red',
                     weight: 4
                 }).addTo(map);
                 //}
                 //map.fitBounds(polyline.getBounds());
             }
         }

         var search = function(sId, gId) {
             var sNode = gnodes[sId];
             var gNode = gnodes[gId];
             astar(sNode, gNode);
         }

         var showWays = function(ind) {
             console.log(ways[ind]);
             for (var j = 0; j < ways[ind].nodes.length; j++) {
                 var node = ways[ind].nodes[j];
                 //var point = L.marker([node.latLng.lat,node.latLng.lng]).addTo(map);
                 //point.bindPopup(value);
             }
         }
         var showWayById = function(id) {
             for (var i = 0; i < ways.length; i++) {
                 if (ways[i].id == id) {
                     console.log(ways[i]);
                     for (var j = 0; j < ways[i].nodes.length; j++) {
                         var node = ways[i].nodes[j];
                         //var point = L.marker([node.latLng.lat,node.latLng.lng]).addTo(map);
                         //point.bindPopup(value);
                     }
                 }
             }
         }

         function connectNodes(nodeId, nextNodeId) {
             if (!(liGraph[nodeId])) {
                 liGraph[nodeId] = new Array();
                 //totalNodes++;
             }
             if (!(nextNodeId in liGraph)) {
                 liGraph[nextNodeId] = new Array();
                 //totalNodes++;
             }
             if (nodeId == nextNodeId) return;
             liGraph[nodeId].push(nextNodeId);
             liGraph[nextNodeId].push(nodeId);
         }

         function connectWay(way) {
             var nodes = way.nodes;
             for (var j = 0; j < nodes.length - 1; j++) {
                 var node = nodes[j];
                 var nextNode = nodes[j + 1];
                 var nodeId = node.id;
                 var nextNodeId = nextNode.id;
                 connectNodes(nodeId, nextNodeId);
             }
         }

         function findLastNodeId(member) {
             if (member.type == "node") return member.id;
             else if (member.type == "way") return member.nodes[member.nodes.length - 1].id;
         }

         function createGraph() {
             liGraph = {};
             for (var i = 0; i < relations.length; i++) {
                 var relation = relations[i];
                 var members = relation.members;
                 //console.log(members);

                 var memSoFar = 0;
                 for (var i in members) {
                     if (memSoFar == 0) {
                         if (members[i].type == "node") connectNodes(members[i].id, members[i].id);
                         else if (members[i].type == "way") connectWay(members[i]);
                     } else {
                         var curMem = members[i];
                         if (curMem.type == "node") {
                             var prevMemLastNodeId = findLastNodeId(members[i - 1]);
                             connectNodes(curMem.id, prevMemLastNodeId);
                         } else {
                             var prevMemLastNodeId = findLastNodeId(members[i - 1]);
                             if (curMem.nodes.length > 0) {
                                 connectNodes(curMem.nodes[0].id, prevMemLastNodeId);
                                 connectWay(curMem);
                             }
                         }
                     }
                     memSoFar++;
                 }

             }
             console.log(liGraph);
         }

         function findNearestInGraph(latLng) {
             var lowestDist = 99999999.99;
             var resNode;
             for (var j in liGraph) {
                 var node = gnodes[j];
                 //var point = L.marker([node.latLng.lat,node.latLng.lng]).addTo(map);
                 var dist = (node.latLng.lat - latLng.lat) * (node.latLng.lat - latLng.lat) + (node.latLng.lng - latLng.lng) * (node.latLng.lng - latLng.lng);
                 if (dist < lowestDist) {
                     lowestDist = dist;
                     resNode = node;
                 }
             }
             return resNode;
         }