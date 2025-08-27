import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import startupsData from './data/startups.json';
import './App.css';

function App() {
  const [allStartups, setAllStartups] = useState([]);
  const [startups, setStartups] = useState([]);
  const [limit, setLimit] = useState("100"); // por defecto Top 100
  const simulationRef = useRef(null);

  // Escala de colores para todos los sectores (constante)
  const allSectors = Array.from(new Set(allStartups.map(d => d.sector)));
  const brightColors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", 
    "#33FFF3", "#FFC733", "#FF3333", "#33FF8A", "#8A33FF",
    "#FF8A33", "#33A8FF", "#A8FF33", "#FF33F0", "#33FFDA"
  ];

  const colorScale = d3.scaleOrdinal()
    .domain(allSectors)
    .range(brightColors.slice(0, allSectors.length));


  // === Ad script ===
  useEffect(() => {
    // Script de configuración
    window.atOptions = {
      key: 'c084a98abc31060d7b59285c7b0100a6',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {}
    };

    const scriptInvoke = document.createElement("script");
    scriptInvoke.src = "//www.highperformanceformat.com/c084a98abc31060d7b59285c7b0100a6/invoke.js";
    scriptInvoke.async = true;

    // Insertarlo dentro del div #ad-container
    const adContainer = document.getElementById("ad-container");
    if (adContainer) {
      adContainer.appendChild(scriptInvoke);
    }

    // Cleanup al desmontar
    return () => {
      if (adContainer) adContainer.removeChild(scriptInvoke);
    };
  }, []);

  
  // Tooltip
  useEffect(() => {
    if (!document.getElementById('tooltip')) {
      const tooltip = document.createElement('div');
      tooltip.id = 'tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.background = 'rgba(0,0,0,0.7)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '8px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.opacity = 0;
      tooltip.style.transition = 'opacity 0.2s';
      document.body.appendChild(tooltip);
    }
  }, []);

  // Traer y ordenar datos
  useEffect(() => {
    const sorted = [...startupsData].sort((a, b) => b.valuation - a.valuation);
    setAllStartups(sorted);
  }, []);

  // Filtrar según límite
  useEffect(() => {
    if (limit === "all") {
      setStartups(allStartups);
    } else {
      setStartups(allStartups.slice(0, parseInt(limit)));
    }
  }, [limit, allStartups]);

  // D3: dibujar burbujas
  useEffect(() => {
    if (startups.length === 0) return;

    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.6;

    // limpiar SVG
    d3.select('#chart').selectAll('*').remove();
    const svg = d3.select('#chart')
                  .attr('width', width)
                  .attr('height', height)
                  .style('background', '#0e0e0e');
    const g = svg.append('g');

    // escala de radios
    const valuations = startups.map(d => d.valuation).sort((a,b) => a-b);
    const minV = d3.quantile(valuations, 0.05);
    const maxV = d3.quantile(valuations, 0.95);
    const maxRadius = Math.min(100, width / (startups.length ** 0.5)); 
    const radiusScale = d3.scaleSqrt()
      .domain([minV, maxV])
      .range([5, maxRadius])
      .clamp(true);

    // --- Centros por sector dinámicos ---
    const visibleSectors = Array.from(new Set(startups.map(d => d.sector)));
    const cols = Math.ceil(Math.sqrt(visibleSectors.length));
    const rows = Math.ceil(visibleSectors.length / cols);
    const rowHeight = height / rows;
    const colWidth = width / cols;


    const sectorCenters = {};
    visibleSectors.forEach((sector, i) => {
      sectorCenters[sector] = {
        x: colWidth * (i % cols + 0.5),
        y: rowHeight * (Math.floor(i / cols) + 0.5),
      };
    });

    // --- Tooltip ---
    const tooltip = d3.select('#tooltip');

    function ticked() {
      const u = g.selectAll('circle')
                .data(startups)
                .join('circle')
                .attr('r', d => radiusScale(d.valuation))
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('fill', d => colorScale(d.sector))
                .attr('stroke', '#333')
                .attr('stroke-width', 1.5)
                .style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))')
                .style('cursor', 'pointer')
                .call(d3.drag()   // <<< Añadido drag
                    .on('start', (event, d) => {
                        if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on('drag', (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on('end', (event, d) => {
                        if (!event.active) simulationRef.current.alphaTarget(0);
                        d.fx = null; // si quieres que vuelva a moverse libremente
                        d.fy = null;
                    })
                );

      u.on('mouseover', (event, d) => {
          tooltip.style('opacity', 1)
                .html(`<b>${d.name}</b><br/>${d.sector}<br/>${(d.valuation / 1000).toFixed(1)}B$`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
        })
        .on('mousemove', (event) => {
          tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', () => tooltip.style('opacity', 0));
    }

    // --- Simulación ---
    if (simulationRef.current) simulationRef.current.stop();
    simulationRef.current = d3.forceSimulation(startups)
      .force('charge', d3.forceManyBody().strength(-30))
      .force('collision', d3.forceCollide().radius(d => radiusScale(d.valuation) + 2))
      .force('x', d3.forceX(d => (sectorCenters[d.sector]?.x || width/2)).strength(0.2))
      .force('y', d3.forceY(d => (sectorCenters[d.sector]?.y || height/2)).strength(0.2))
      .on('tick', ticked)
      .alpha(1)
      .restart();

    // --- Zoom solo centrado ---
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])       // zoom hacia dentro y fuera
    .on('zoom', (event) => {
    g.attr('transform', event.transform); // zoom centrado en el cursor
  });
    svg.call(zoom);

    // Ajuste inicial de zoom centrado
    svg.call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(0.6).translate(-width/2, -height/2));

  }, [startups]);

  // Leyenda solo con sectores visibles
  const visibleSectors = Array.from(new Set(startups.map(d => d.sector)));

  return (
    <div className="App">
      <h1 style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
         Startup Bubbles
      </h1>
        {/* Total valuation */}
  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
    Total Valuation: {(startups.reduce((acc, s) => acc + s.valuation, 0) / 1000000).toFixed(2)}T$
  </div>

      {/* Selector Top N */}
      <div style={{ textAlign: 'center', marginBottom: '15px', marginTop: '14px' }}>
        <label style={{ color: 'white', marginRight: '10px' }}>Show:</label>
        <select value={limit} onChange={(e) => setLimit(e.target.value)}>
          <option value="50">Top 50</option>
          <option value="100">Top 100</option>
          <option value="200">Top 200</option>
          <option value="500">Top 500</option>
          <option value="1000">Top 1000</option>
          <option value="all">All</option>
        </select>
      </div>
      <svg id="chart"   style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', marginTop: '30px' }}></svg>

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px', gap: '10px' }}>
        {visibleSectors.map(sector => (
          <div key={sector} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: colorScale(sector),
              border: '1px solid #fff'
            }}></div>
            <span style={{ color: 'white' }}>{sector}</span>
          </div>
        ))}
      </div>
      <div id="ad-container" style={{ textAlign: 'center', margin: '20px 0' }}></div>

      {/* Tabla debajo del SVG */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Value (B$)</th>
              <th>Sector</th>
              <th>Country</th>
              
            </tr>
          </thead>
          <tbody>
            {startups.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>
                <td>{s.name}</td>
                <td>{(s.valuation / 1000).toFixed(1)}</td>                
                <td>{s.sector}</td>
                <td>{s.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
