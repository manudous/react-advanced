# 02 Portales

## Resumen

Vamos a cubrir un concepto interesante de React, los Portales. Los Portales nos permiten renderizar un componente en un nodo del DOM que no es hijo del nodo donde se renderiza el componente padre. Estos fueron introducidos en React 16.

¿Por qué quiero esto? Bueno, si tenemos un componente que renderiza un modal, y queremos que el modal se muestre en el DOM raíz, y no en el DOM del componente padre, podemos usar un portal, más usos, hover, tooltips etc...

Oye pero si esto ya lo puedo hacer yo con el z-index... Ehh ummm claro, z-index 9999,
¿O era? 999999, o 99999999 :)

Vamos a ver como funciona esto paso a paso, partiremos de un ejemplo muy simple e iremos
añadiéndole funcionalidad encima hasta tener un component de diálogo modal.

## Paso a Paso

- Este ejemplo toma como punto de partida el ejemplo _00-boiler-plate_.

- Primero copiamos el ejemplo anterior, y hacemos un _npm install_

```bash
npm install
```

Para crear un component fuera del sitio donde se renderiza el componente padre (es
decir fuera de su orden natural), _React Dom_ expone una función llamada
_createPortal_, esta función acepta dos parámetros:

- El componente que queremos renderizar.
- El nodo del DOM donde queremos renderizar el componente.

Vamos a partir de un ejemplo muy simple, en el HTML vamos añadir un Div que será
el último elemento del body (lo identificaremos con el id _lastnode_):

_./index.html_

```diff
  <body>
    <div id="root"></div>
+    <div id="lastnode"></div>
  </body>
```

Ya tenemos el nodo HTML, para que nuestro código quede más limpio, vamos a crearnos un wrapper que hará uso de _createPortal_ (este componente lo haremos crecer más adelante).

Aceptamos como props:

- Children: el estándar de React.
- wrapperId: el id del nodo donde queremos renderizar el componente.

Y el componente de vuelve un componente que se instancia en el nodo del DOM que
cuyo id le hemos pasado como parámetro.

_./src/common/components/react-portal.component.tsx_

```tsx
interface Props {
  children: React.ReactNode;
  wrapperId: string;
}

export const ReactPortalComponent: React.FC<Props> = (props) => {
  const { children, wrapperId } = props;
  return createPortal(children, document.getElementById(wrapperId));
};
```

Vamos ahora a _app.tsx_, vamos a renderizar el siguiente contenido:

```diff
import React from "react";

export const App = () => {
  return (
    <div>
      <h1> Hello React !!</h1>
+      <h3>I want to be at the end</h3>
+      <h2> Sub title</h2>
    </div>
  );
};
```

Si ejecutamos esto, podemos ver (cómo es de esperar) que el _h3_ se renderiza antes
que el _h2_,

> Abre el inspector y comprueba que esto es así en el HTML generado.

¿Y si pudieramos decirle a React que lo renderizara en el nodo del DOM _lastnode_?

```diff
import React from "react";
+ import { ReactPortalComponent } from "./common/components/react-portal.component";

export const App = () => {
  return (
    <div>
      <h1> Hello React !!</h1>
+      <ReactPortalComponent wrapperId="lastnode">
        <h3>I want to be at the end</h3>
+      </ReactPortalComponent>
      <h2> Sub title</h2>
    </div>
  );
};
```

Si ahora ejecutamos esto podemos ver que el h3 aparece al final del todo, y si abrimos el inspector podemos ver que este componente cae debajo del node _lastnode_ que habíamos
definido.

> Abrir inspector y ver que el h3 está debajo del nodo lastnode.

¿Para qué nos puede servir esto? fíjate que si renderizo en el último div de un body
querrá decir que va a estar por encima de todo (no me haría falta tirar de z-index
salvo que alguna librería o código legacy lo esté usando), es más podría hasta
implementar de forma determinista el patrón malvado de UI de un modal sobre un modal.

Antes de seguir implementando el _modal_ vamos a darle un poco de cariño a la función
helper que hemos creado (ReactPortalComponent), lo primero eso de tener un div
a fuego en el HTML para el último nodo no suena a algo muy mantenible, ¿Y si no
hiciera falta ponerlo? Podíamos comprobar si existe, en ese caso tiramos de él, y
si no lo creamos al vuelo, además así evitamos un castañazo bíblico si este tag
no existe en el HTML.

Vamos a crear una función de ayuda para crear elementos de forma dinámica:

_./src/common/components/react-portal.component.tsx_

```diff
+ function createWrapperAndAppendToBody(wrapperId) {
+  const wrapperElement = document.createElement('div');
+  wrapperElement.setAttribute("id", wrapperId);
+  document.body.appendChild(wrapperElement);
+  return wrapperElement;
+ }

interface Props {
```

Y ahora vamos a darle uso en nuestro _ReactPortalComponent_:

- Primero comprobamos si existe el nodo del DOM.
- Si existe tiramos, pero si no lo creamos usando el helper.

_./src/common/components/react-portal.component.tsx_

```diff
export const ReactPortalComponent: React.FC<Props> = (props) => {
  const { children, wrapperId } = props;

+  let element = document.getElementById(wrapperId);

+  if (!element) {
+    element = createWrapperAndAppendToBody(wrapperId);
+  }

  return createPortal(children, document.getElementById(wrapperId));
};
```

Pero que pasa que si lo creamos al vuelo, lo suyo es eliminarlo cuando ya no esté
en uso el componente (no queremos ir dejando basura especial), aquí vamos a
aprovecharnos de la función _useEffect_ que nos ofrece React, ¿Podemos usar
un effect dentro de esta función? La respuesta es si, ya que esto se invoca
dentro de un componente de React, y por tanto podemos usar los hooks.

En este caso como vamos a manipular directamente el DOM,y queremos que el código
se ejecute de forma síncrona antes de que el DOM se repinte, así que en vez
de _useEffect_ vamos a usar _useLayooutEffect_, que vamos a hacer:

- Crear un estado para guardar una referencia al nodo del DOM (en caso de que se cree de forma dinámica)
- En el _useLayoutEffect_, comprobamos si el nodo existe, en caso de que no
  creamos el nodo y lo guardamos en el estado, después en el destructuro del _useEffectLayout_ lo eliminamos.

```diff
export const ReactPortalComponent: React.FC<Props> = (props) => {
+  const [wrapperElement, setWrapperElement] = React.useState(null);
  const { children, wrapperId } = props;

+ React.useLayoutEffect = (() => {
  let element = document.getElementById(wrapperId);
+  let createdOnTheFly = false;
+
  if (!element) {
    element = createWrapperAndAppendToBody(wrapperId);
+    createdOnTheFly = true;
  }
+   setWrapperElement(element);

+    return () => {
+      // Si lo hemos creado de forma dinámica lo borramos cuando toque
+      if (createdOnTheFly && element.parentNode) {
+        element.parentNode.removeChild(element);
+      }
+    }
+ }, [wrapperId])

+  // Ojo en el primer render wrapperElement va a ser nulo, saltamos ese caso
+    if (wrapperElement === null) return null;

  return createPortal(children, document.getElementById(wrapperId));
};
```

Ahora podemos eliminar el div del HTML y el código sigue funcionando.

> IMPORTANTE DEPURAR ESTE CODIGO, y ver como funciona, que pasraría si pusieramos el wrapper
> en vez del wrapperId?

_./src/index.html_

```diff
  <body>
    <div id="root"></div>
-    <div id="lastnode"></div>
  </body>
```