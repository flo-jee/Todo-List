import { useEffect, useRef, useState } from "react";
import "./App.css";
// todo 생성
function App() {
  const [todo, setTodo] = useState([
    {
      id: Number(new Date()),
      content: "안녕하세요",
    },
  ]);

  return (
    <>
      <TodoInput setTodo={setTodo} />
      <TodoList todo={todo} setTodo={setTodo} />
      <h1>TODO LIST</h1>
    </>
  );
}

// todo 생성
const TodoInput = ({ setTodo }) => {
  const inputRef = useRef(null);

  const addTodo = () => {
    const newTodo = {
      id: Number(new Date()),
      content: inputRef.current.value,
    };
    setTodo((prev) => [...prev, newTodo]);
  };
  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={addTodo}>추가</button>
    </>
  );
};

// todo 수정
const TodoList = ({ todo, setTodo, currentTodo, setCurrentTodo }) => {
  return (
    <ul>
      {todo.map((el) => (
        <Todo key={el.id} todo={el} setTodo={setTodo} />
      ))}
    </ul>
  );
};

// todo 삭제
const Todo = ({ todo, setTodo, currentTodo, setCurrentTodo }) => {
  console.log(todo);
  return (
    <li>
      {todo.content}
      <button
        onClick={() => {
          setTodo((prev) => prev.filter((el) => el.id !== todo.id));
        }}
      >
        삭제
      </button>
    </li>
  );
};

export default App;
