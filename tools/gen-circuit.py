"""Generate public/assets/img/bg-circuit.svg — a seamless tile of faint
circuit-board traces used as the page background.

Usage:  python3 tools/gen-circuit.py   (change SEED / COLOR / sizes below to vary it)
"""
import random
SEED = 11
COLOR = '#d9d9d4'
random.seed(SEED)
T=720; C=12; N=T//C; M=1
occ=set()
DIRS=[(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1),(0,-1),(1,-1)]
inb=lambda x,y: M<=x<N-M and M<=y<N-M
def free(x,y): return inb(x,y) and (x,y) not in occ
def mark(path):
    for x,y in path:
        for dx in(-1,0,1):
            for dy in(-1,0,1): occ.add((x+dx,y+dy))
def plan(d0):
    """direction sequence: orthogonal runs joined by short 45° jogs"""
    seq=[]; d=d0
    for _ in range(random.randint(1,3)):
        seq+= [d]*random.randint(4,12)
        turn=random.choice([1,-1]); jd=(d+turn)%8
        seq+= [jd]*random.randint(1,4)
        d = d if random.random()<0.5 else (d+2*turn)%8
    seq+=[d]*random.randint(3,10)
    return seq
def trace(x,y,seq,check=True):
    p=[(x,y)]
    for d in seq:
        dx,dy=DIRS[d]; x,y=x+dx,y+dy
        if (check and not free(x,y)) or not inb(x,y): break
        p.append((x,y))
    return p
paths=[]
def bus(n):
    for _ in range(200):
        d0=random.choice([0,2,4,6]); x,y=random.randrange(N),random.randrange(N)
        seq=plan(d0)
        perp=DIRS[(d0+2)%8]
        starts=[(x+perp[0]*k*2,y+perp[1]*k*2) for k in range(n)]
        if not all(free(*s) for s in starts): continue
        group=[trace(sx,sy,seq) for sx,sy in starts]
        L=min(len(g) for g in group)
        if L<8: continue
        group=[g[:L] for g in group]
        for g in group: paths.append(g)
        for g in group: mark(g)
        return
for n in (4,4,3,3,3,2,2,2,2): bus(n)
tries=0
while tries<6000:
    tries+=1
    x,y=random.randrange(N),random.randrange(N)
    if not free(x,y): continue
    p=trace(x,y,plan(random.choice([0,2,4,6])))
    if len(p)>=8: paths.append(p); mark(p)
col=COLOR
out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{T}" height="{T}" viewBox="0 0 {T} {T}">',
     '  <!-- Repeating background tile: faint circuit-board traces (generated) -->',
     f'  <g fill="none" stroke="{col}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">']
P=lambda c:(c[0]*C+C/2, c[1]*C+C/2)
for p in paths:
    pts=[P(c) for c in p]; s=[pts[0]]
    for i in range(1,len(pts)-1):
        a,b,c=s[-1],pts[i],pts[i+1]
        if (b[0]-a[0])*(c[1]-b[1])!=(b[1]-a[1])*(c[0]-b[0]): s.append(b)
    s.append(pts[-1])
    out.append('    <path d="M'+' L'.join(f'{x:g} {y:g}' for x,y in s)+'"/>')
for p in paths:
    for c in (p[0],p[-1]):
        x,y=P(c); out.append(f'    <circle cx="{x:g}" cy="{y:g}" r="2.6"/>')
out.append('  </g>\n</svg>\n')
open(__import__('pathlib').Path(__file__).resolve().parent.parent / 'public/assets/img/bg-circuit.svg','w').write('\n'.join(out))
print(len(paths), len('\n'.join(out)))
