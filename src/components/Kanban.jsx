import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const initialTasks = {
  pendente: [
    { id: "1", content: "Task 1" },
    { id: "2", content: "Task 2" },
  ],
  analise: [
    { id: "3", content: "Task 3" },
  ],
  resolvido: []
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = Array.from(tasks[source.droppableId]);
    const destColumn = Array.from(tasks[destination.droppableId]);
    const [movedTask] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, movedTask);

    setTasks({ ...tasks, [source.droppableId]: sourceColumn, [destination.droppableId]: destColumn });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-row gap-4 p-4 justify-center">
        {Object.entries(tasks).map(([columnId, columnTasks]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-1/3 bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300 min-h-[300px] flex flex-col"
              >
                <h2 className="text-lg font-bold mb-2 text-center">
                  {columnId === "pendente" ? "Pendente" : columnId === "analise" ? "Em Análise" : "Resolvido"}
                </h2>
                <div className="flex-1">
                  {columnTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 rounded-md shadow-sm mb-2 border border-gray-400 cursor-pointer"
                        >
                          {task.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
