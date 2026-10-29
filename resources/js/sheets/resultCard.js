export function createResultCard(title,id) {
  const wrapper=document.createElement('section');
  wrapper.id=id;wrapper.className='pr-panel arco-result-card sheet-result-card';
  const heading=document.createElement('div');heading.className='arco-result-heading';
  const h3=document.createElement('h3');h3.id=id+'-title';h3.textContent=title;
  heading.append(h3);wrapper.append(heading);wrapper.setAttribute('aria-labelledby',h3.id);
  const scroll=document.createElement('div');scroll.className='arco-table-scroll';
  scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',title);
  wrapper.append(scroll);
  return {wrapper,scroll};
}
