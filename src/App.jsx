import { useState, useEffect, useRef } from "react";
import "./App.css";

// todo 생성
function App() {
  const [isLoading, data] = useFetch("http://localhost:3000/todo");
  const [todo, setTodo] = useState([]);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [time, setTime] = useState(0);
  const [isTimer, setIsTimer] = useState(false);

  useEffect(() => {
    if (currentTodo) {
      fetch(`http://localhost:3000/todo/${currentTodo}`, {
        method: "PATCH",
        body: JSON.stringify({
          time: todo.find((el) => el.id === currentTodo).time + 1,
        }),
      })
        .then((res) => res.json())
        .then((res) =>
          setTodo((prev) =>
            prev.map((el) => (el.id === currentTodo ? res : el)),
          ),
        );
    }
  }, [time]);

  useEffect(() => {
    setTime(0);
  }, [isTimer]);

  useEffect(() => {
    if (data) setTodo(data);
  }, [isLoading]);

  return (
    <>
      <h1>TODO LIST</h1>
      <Clock />
      <Advice />
      <button onClick={() => setIsTimer((prev) => !prev)}>
        {isTimer ? "스톱워치로 변경" : "타이머로 변경"}
      </button>
      {isTimer ? (
        <Timer time={time} setTime={setTime} />
      ) : (
        <StopWatch time={time} setTime={setTime} />
      )}

      <TodoInput setTodo={setTodo} />
      <TodoList
        todo={todo}
        setTodo={setTodo}
        setCurrentTodo={setCurrentTodo}
        currentTodo={currentTodo}
      />
    </>
  );
}

// todo 생성
const TodoInput = ({ setTodo }) => {
  const inputRef = useRef(null);
  const addTodo = () => {
    const newTodo = {
      content: inputRef.current.value,
      time: 0,
    };
    fetch("http://localhost:3000/todo", {
      method: "POST",
      body: JSON.stringify(newTodo),
    })
      .then((res) => res.json())
      .then((res) => setTodo((prev) => [...prev, res]));
  };
  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={addTodo}>추가</button>
    </>
  );
};
// todo 조회
const TodoList = ({ todo, setTodo, setCurrentTodo, currentTodo }) => {
  return (
    <ul>
      {todo.map((el) => (
        <Todo
          key={el.id}
          todo={el}
          setTodo={setTodo}
          currentTodo={currentTodo}
          setCurrentTodo={setCurrentTodo}
        />
      ))}
    </ul>
  );
};
// todo 삭제
const Todo = ({ todo, setTodo, setCurrentTodo, currentTodo }) => {
  console.log(todo);
  return (
    <li className={currentTodo === todo.id ? "current" : ""}>
      <div>
        {todo.content}
        <br />
        {formatTime(todo.time)}
      </div>
      <div>
        <button onClick={() => setCurrentTodo(todo.id)}>시작하기</button>
        <button
          onClick={() => {
            fetch(`http://localhost:3000/todo/${todo.id}`, {
              method: "DELETE",
            }).then((res) => {
              if (res.ok) {
                setTodo((prev) => prev.filter((el) => el.id !== todo.id));
              }
            });
          }}
        >
          삭제
        </button>
      </div>
    </li>
  );
};

const useFetch = (url) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      });
  }, [url]);
  return [isLoading, data];
};

// 랜덤명언 가져오기
const Advice = () => {
  const [isLoading, data] = useFetch(
    "https://korean-advice-open-api.vercel.app/api/advice",
  );

  return (
    <>
      {!isLoading && (
        <>
          <div className="advice">{data.message}</div>
          <div className="advice">-{data.author}-</div>
        </>
      )}
    </>
  );
};

// 현재 시각 구현
const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    setInterval(() => {
      setTime(new Date());
    }, 1000);
  }, []);

  return <div className="clock">{time.toLocaleTimeString()}</div>;
};

// 스톱워치 초기화
const formatTime = (seconds) => {
  const timeString = `${String(Math.floor(seconds / 3600)).padStart(2, "0")}
  : ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}
  : ${String(seconds % 60).padStart(2, "0")}`;
  return timeString;
};
// 스톱워치
const StopWatch = ({ time, setTime }) => {
  const [isOn, setIsOn] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    if (isOn === true) {
      const timerId = setInterval(() => {
        setTime((prev) => prev + 1);
        timerRef.current = timerId;
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
  }, [isOn]);

  return (
    <div>
      {formatTime(time)}
      <button onClick={() => setIsOn((prev) => !prev)}>
        {isOn ? "끄기" : "켜기"}
      </button>
      <button
        onClick={() => {
          setTime(0);
          setIsOn(false);
        }}
      >
        리셋
      </button>
    </div>
  );
};

// 타이머
const Timer = ({ time, setTime }) => {
  const [startTime, setStartTime] = useState(0);
  const [isOn, setIsOn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOn && time > 0) {
      const timerId = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
      timerRef.current = timerId;
    } else if (!isOn || time == 0) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isOn, time]);

  return (
    <div>
      <div>
        {time ? formatTime(time) : formatTime(startTime)}
        <button
          onClick={() => {
            setIsOn(true);
            setTime(time ? time : startTime);
            setStartTime(0);
          }}
        >
          시작
        </button>
        <button onClick={() => setIsOn(false)}>멈춤</button>
        <button
          onClick={() => {
            setTime(0);
            setIsOn(false);
          }}
        >
          리셋
        </button>
      </div>
      <input
        type="range"
        value={startTime}
        min="0"
        max="3600"
        step="30"
        onChange={(event) => setStartTime(event.target.value)}
      />
    </div>
  );
};

export default App;
