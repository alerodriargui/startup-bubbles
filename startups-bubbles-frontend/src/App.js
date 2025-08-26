import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './App.css';
import startupsData from './data/startups.json';

function App() {
  const [allStartups, setAllStartups] = useState([]);
  const [startups, setStartups] = useState([]);
  const [limit, setLimit] = useState("100"); // por defecto Top 100

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

  // Traer datos del backend
useEffect(() => {
  const sorted = [...startupsData].sort((a, b) => b.valuation - a.valuation);
  setAllStartups(sorted);
}, []);

  // Filtrar según el límite
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

  d3.select('#chart').selectAll('*').remove();
  const svg = d3.select('#chart')
                .attr('width', width)
                .attr('height', height)
                .style('background', '#0e0e0e');

  // Contenedor para aplicar transformaciones (zoom/pan)
  const g = svg.append('g');

const valuations = startups.map(d => d.valuation).sort((a,b) => a-b);
const minV = d3.quantile(valuations, 0.05);
const maxV = d3.quantile(valuations, 0.95);

const radiusScale = d3.scaleSqrt()
  .domain([minV, maxV])
  .range([20, 80])
  .clamp(true);



  const colorScale = d3.scaleOrdinal()
                       .domain(['Tech', 'Health', 'Fintech', 'AI'])
                       .range(['#f39c12', '#e74c3c', '#2ecc71', '#3498db']);

const simulation = d3.forceSimulation(startups)
  .force('charge', d3.forceManyBody().strength(-30)) // menos fuerte, para que no se repelan demasiado
  .force('collision', d3.forceCollide().radius(d => radiusScale(d.valuation) + 2))
  .force('x', d3.forceX(d => Math.random() * width).strength(0.05)) // posiciones aleatorias dentro del ancho
  .force('y', d3.forceY(d => Math.random() * height).strength(0.05))
  .on('tick', ticked);


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
               .style('cursor', 'pointer');

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

  // ZOOM y PAN
  const zoom = d3.zoom()
                 .scaleExtent([0.5, 5]) // mínimo 0.5x, máximo 5x
                 .on('zoom', (event) => {
                   g.attr('transform', event.transform);
                 });

  svg.call(zoom);

}, [startups]);


  return (
    <div className="App">
      <h1 style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
        Unicorn Startups Bubbles
      </h1>

      {/* Selector Top N */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <label style={{ color: 'white', marginRight: '10px' }}>Show:</label>
        <select value={limit} onChange={(e) => setLimit(e.target.value)}>
          <option value="100">Top 100</option>
          <option value="200">Top 200</option>
          <option value="500">Top 500</option>
          <option value="1000">Top 1000</option>
          <option value="all">All</option>
        </select>
      </div>

      <svg id="chart" style={{ display: 'block', margin: '0 auto' }}></svg>

      {/* Tabla debajo del SVG */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Value (B$)</th>
              <th>Sector</th>
              <th>Country</th>
              <th>Date Joined</th>
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
                <td>{s.dateJoined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
