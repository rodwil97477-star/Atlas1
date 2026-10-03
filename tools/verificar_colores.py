# Uso: python3 tools/verificar_colores.py dashboard/data.js  (mide si los colores de categoría se distinguen)
# Mide qué tan distinguibles son los colores de categoría (OKLab ΔE) en visión normal
# y simulando deuteranopía/protanopía (Machado 2009, severidad 1.0).
import itertools, json, sys, re
def lin(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def rgb(h): return [int(h[i:i+2],16) for i in (1,3,5)]
def oklab(rl):
    r,g,b=rl
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b; m=0.2119034982*r+0.6806995451*g+0.1073969566*b; s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l,m,s=[x**(1/3) for x in (l,m,s)]
    return (0.2104542553*l+0.7936177850*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s, 0.0259040371*l+0.7827717662*m-0.8086757660*s)
MD={'deut':[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
    'prot':[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]}
def sim(rl,k):
    M=MD[k]; return [max(0,min(1,sum(M[i][j]*rl[j] for j in range(3)))) for i in range(3)]
def de(a,b,k=None):
    A=[lin(x) for x in rgb(a)]; B=[lin(x) for x in rgb(b)]
    if k: A,B=sim(A,k),sim(B,k)
    p,q=oklab(A),oklab(B); return sum((x-y)**2 for x,y in zip(p,q))**0.5
def lum(h): r,g,b=[lin(x) for x in rgb(h)]; return 0.2126*r+0.7152*g+0.0722*b
def contrast(a,b): x,y=sorted([lum(a),lum(b)]); return (y+0.05)/(x+0.05)
ESTADOS={'acento celeste':'#5AC8FA','verde (vas bien)':'#7CFA9E','amarillo (vas justo)':'#FFD84D','rojo (te pasaste)':'#FF5A5F'}
def informe(N1,N2,N3,grupos2,grupos3,umbral=0.10,umbral_cb=0.06):
    malos=[]
    def chk(nombre,conj):
        for (a,ca),(b,cb) in itertools.combinations(conj.items(),2):
            d=de(ca,cb); dd=min(de(ca,cb,'deut'),de(ca,cb,'prot'))
            if d<umbral or dd<umbral_cb: malos.append(f"{nombre}: {a} {ca} vs {b} {cb}  ΔE={d:.3f} daltónico={dd:.3f}")
    chk('nivel 1',N1)
    for g,hijos in grupos2.items(): chk('grupo '+g,{h:N2[h] for h in hijos})
    for g,hijos in grupos3.items(): chk('subgrupo '+g,{h:N3[h] for h in hijos})
    todos={**N1,**N2,**N3}
    for n,c in todos.items():
        for en,ec in ESTADOS.items():
            if de(c,ec)<0.09: malos.append(f"choca con estado {en}: {n} {c} ΔE={de(c,ec):.3f}")
        if contrast(c,'#18181D')<4.5: malos.append(f"poco contraste sobre tarjeta: {n} {c} {contrast(c,'#18181D'):.2f}:1")
    return malos
G2={'personal':['fijo','variable','salud y bienestar','auto y movilidad'],'social':['pareja','amigos','trabajo'],'finanzas':['inversiones y ahorro','prestamos']}
G3={'fijo':['vivienda','servicios','suscripciones','seguros','educacion'],
    'variable':['comida diaria','ropa','cuidado personal','mascotas','tecnologia','ocio y hobbies'],
    'salud y bienestar':['consultas medicas','medicinas','deporte'],
    'auto y movilidad':['combustible','cochera','mantenimiento y estetica','peajes','transporte publico'],
    'pareja':['comida casual','comida especial','regalos','escapadas','detalles'],
    'amigos':['comidas','diversion salidas','viajes paseos'],
    'trabajo':['almuerzos oficina','transporte','eventos'],
    'inversiones y ahorro':['compra acciones etfs','fondo de emergencia']}
def leer_js(path):
    s=open(path).read(); out=[]
    for nom in ('COLOR_N1','COLOR_N2','COLOR_N3'):
        blk=re.search(nom+r" = \{(.*?)\};",s,re.S).group(1)
        out.append(dict(re.findall(r"'([^']+)':'(#[0-9A-Fa-f]{6})'",blk)))
    return out
if __name__=='__main__':
    for path in sys.argv[1:]:
        N1,N2,N3=leer_js(path)
        print('==',path,'| Personal vs Social ΔE=%.3f (daltónico %.3f)'%(de(N1['personal'],N1['social']),min(de(N1['personal'],N1['social'],'deut'),de(N1['personal'],N1['social'],'prot'))))
        m=informe(N1,N2,N3,G2,G3,0.10,0.045); print(len(m),'problemas'); print('\n'.join(m[:40]))
