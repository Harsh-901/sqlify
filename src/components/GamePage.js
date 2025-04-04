import React, { useState, useEffect } from 'react';
import '../game.css';
import EnhancedAnimation from './EnhancedAnimation';
import Chatbot from './SQLChatbot';

const validateQueryResult = (result, task) => {
    // If no validation function, return false
    if (!task.validate) return false;
    
    // Handle potential error responses
    if (result.error) return false;
    
    // Check if the validation function passes
    try {
        return task.validate(result);
    } catch (error) {
        console.error("Validation error:", error);
        return false;
    }
};

const GAME_LEVELS = {
    BEGINNER: {
        name: 'Beginner: Pirate\'s First Voyage',
        theme: 'pirates',
        description: 'Learn basic SQL SELECT and WHERE clauses with a pirate-themed database!',
        database: {
            pirates: [
                { id: 1, name: 'Jack Sparrow', gold: 200, ship: 'Black Pearl', rank: 'Captain', age: 35 },
                { id: 2, name: 'Will Turner', gold: 50, ship: 'Interceptor', rank: 'Blacksmith', age: 25 },
                { id: 3, name: 'Elizabeth Swann', gold: 300, ship: 'Black Pearl', rank: 'Captain', age: 24 },
                { id: 4, name: 'Hector Barbossa', gold: 150, ship: 'Black Pearl', rank: 'First Mate', age: 45 }
            ],
            ships: [
                { shipid: 1, name: 'Black Pearl', captain: 'Jack Sparrow', capacity: 40 },
                { shipid: 2, name: 'Interceptor', captain: 'Will Turner', capacity: 30 },
                { shipid: 3, name: 'Flying Dutchman', captain: 'Davy Jones', capacity: 50 }
            ]
        },
        tasks: [
            { 
                id: 1, 
                question: "Find all pirates with gold > 100", 
                hints: [
                    "Use SELECT * with a WHERE clause", 
                    "The column is 'gold'",
                    "Remember to use the > operator"
                ],
                difficultyRating: 1,
                validate: (result) => {
                    console.log("Validating task 1 result:", result);
                    
                    // Handle different result formats
                    const pirates = Array.isArray(result) ? result : 
                        (result.length > 0 && Array.isArray(result[0]) ? result[0] : []);
                    
                    const expectedIds = [1, 3, 4];
                    const validatedPirates = pirates.filter(pirate => 
                        // Handle different object structures
                        (pirate.gold > 100) || 
                        (pirate.Gold > 100) || 
                        (pirate['gold'] > 100)
                    );
                    
                    console.log("Validated pirates:", validatedPirates);
                    
                    return validatedPirates.length === 3 && 
                        expectedIds.every(id => 
                            validatedPirates.some(p => 
                                p.id === id || p.Id === id || p['id'] === id
                            )
                        );
                }
            },
            { 
                id: 2, 
                question: "Get the names of pirates on 'Black Pearl'", 
                hints: [
                    "Use SELECT name", 
                    "Filter with WHERE ship = 'Black Pearl'",
                    "You may want to use SELECT DISTINCT if duplicates appear"
                ],
                difficultyRating: 1,
                validate: (result) => {
                    console.log("Validating task 2 result:", result);
                    
                    // Handle different result formats
                    const names = Array.isArray(result) ? 
                        (result.length > 0 && typeof result[0] === 'string' ? 
                            result : 
                            result.map(r => r.name || r.Name || r['name'])) : 
                        [];
                    
                    const expectedNames = ['Jack Sparrow', 'Elizabeth Swann', 'Hector Barbossa'];
                    
                    console.log("Extracted names:", names);
                    
                    return names.length === 3 &&
                        expectedNames.every(name => names.includes(name));
                }
            },
            { 
                id: 3, 
                question: "Count how many pirates are captains", 
                hints: [
                    "Use COUNT(*)", 
                    "Filter with WHERE rank = 'Captain'",
                    "Use an aggregate function"
                ],
                difficultyRating: 2,
                validate: (result) => {
                    console.log("Validating task 3 result:", result);
                    
                    // Handle different result formats
                    const count = Array.isArray(result) ? 
                        (result[0].count || result[0].Count || result[0]['count'] || 
                         (result.length && typeof result[0] === 'number' ? result[0] : 0)) : 
                        0;
                    
                    console.log("Extracted count:", count);
                    
                    return count === 2;
                }
            }
        ]
    },
    
    INTERMEDIATE: {
        name: 'Intermediate: Researcher\'s Insight',
        theme: 'academia',
        description: 'Dive into more complex SQL queries with academic research data!',
        database: {
            researchers: [
                { id: 1, name: 'Dr. Alice Johnson', department: 'Computer Science', publications: 45, citations: 1200, h_index: 15 },
                { id: 2, name: 'Prof. Bob Smith', department: 'Physics', publications: 60, citations: 1800, h_index: 20 },
                { id: 3, name: 'Dr. Charlie Brown', department: 'Biology', publications: 35, citations: 900, h_index: 12 },
                { id: 4, name: 'Prof. Diana Martinez', department: 'Computer Science', publications: 55, citations: 1500, h_index: 18 }
            ],
            departments: [
                { dept_id: 1, name: 'Computer Science', head: 'Dr. Alice Johnson', budget: 500000 },
                { dept_id: 2, name: 'Physics', head: 'Prof. Bob Smith', budget: 750000 },
                { dept_id: 3, name: 'Biology', head: 'Dr. Charlie Brown', budget: 400000 }
            ]
        },
        tasks: [
            { 
                id: 1, 
                question: "Find researchers with more than 40 publications", 
                hints: [
                    "Use SELECT * with a WHERE clause",
                    "Check the 'publications' column",
                    "Use > operator"
                ],
                difficultyRating: 2,
                validate: (result) => {
                    const expectedIds = [1, 2, 4];
                    return Array.isArray(result) &&
                        result.length === 3 &&
                        result.every(r => r.publications > 40) &&
                        expectedIds.every(id => result.some(r => r.id === id));
                }
            },
            { 
                id: 2, 
                question: "List distinct departments of researchers", 
                hints: [
                    "Use SELECT DISTINCT",
                    "Select the 'department' column"
                ],
                difficultyRating: 2,
                validate: (result) => {
                    const expectedDepartments = ['Computer Science', 'Physics', 'Biology'];
                    
                    if (result.length > 0 && typeof result[0] === 'string') {
                        return result.length === 3 &&
                            expectedDepartments.every(dept => result.includes(dept));
                    } else {
                        return Array.isArray(result) &&
                            result.length === 3 &&
                            expectedDepartments.every(dept => 
                                result.some(r => r.department === dept)
                            );
                    }
                }
            },
            { 
                id: 3, 
                question: "Calculate average citations for Computer Science researchers", 
                hints: [
                    "Use AVG() aggregate function",
                    "Filter for Computer Science department",
                    "Apply WHERE clause before aggregation"
                ],
                difficultyRating: 3,
                validate: (result) => {
                    const expectedAvg = 1350;
                    return Array.isArray(result) &&
                        result.length === 1 &&
                        Math.abs(result[0].avg - expectedAvg) < 1;
                }
            }
        ]
    },
    EXPERT: {
        name: 'Expert: Treasure Hunter\'s Challenge',
        theme: 'archaeology',
        description: 'Master advanced SQL techniques with archaeological artifact data!',
        database: {
            artifacts: [
                { id: 1, name: 'Golden Mask', origin: 'Egypt', year: -1350, value: 3500000, condition: 'Excellent' },
                { id: 2, name: 'Ancient Scroll', origin: 'China', year: -200, value: 2000000, condition: 'Good' },
                { id: 3, name: 'Roman Sword', origin: 'Italy', year: 100, value: 1500000, condition: 'Fair' },
                { id: 4, name: 'Mayan Tablet', origin: 'Mexico', year: -500, value: 2800000, condition: 'Very Good' },
                { id: 5, name: 'Greek Vase', origin: 'Greece', year: -450, value: 1800000, condition: 'Good' }
            ],
            expeditions: [
                { exp_id: 1, location: 'Egypt', leader: 'Dr. Sarah Connor', year: 2020, budget: 500000 },
                { exp_id: 2, location: 'China', leader: 'Prof. James Lee', year: 2018, budget: 450000 },
                { exp_id: 3, location: 'Mexico', leader: 'Dr. Maria Rodriguez', year: 2022, budget: 600000 }
            ]
        },
        tasks: [
            { 
                id: 1, 
                question: "Find artifacts with value > 2500000", 
                hints: [
                    "Use SELECT * with a WHERE clause",
                    "Filter artifacts by their 'value' column",
                    "Use > operator"
                ],
                difficultyRating: 3,
                validate: (result) => {
                    const expectedIds = [1, 4];
                    return Array.isArray(result) &&
                        result.length === 2 &&
                        result.every(artifact => artifact.value > 2500000) &&
                        expectedIds.every(id => result.some(a => a.id === id));
                }
            },
            { 
                id: 2, 
                question: "List artifacts from before year 0, sorted by value", 
                hints: [
                    "Use WHERE year < 0",
                    "Hint: You might need ORDER BY clause"
                ],
                difficultyRating: 4,
                validate: (result) => {
                    const expectedIds = [1, 4, 2, 5];
                    return Array.isArray(result) &&
                        result.length === 4 &&
                        result.every(artifact => artifact.year < 0) &&
                        result[0].id === 1 &&
                        result[1].id === 4 &&
                        result[2].id === 2 &&
                        result[3].id === 5;
                }
            },
            { 
                id: 3, 
                question: "Calculate total value of artifacts in 'Excellent' condition", 
                hints: [
                    "Use SUM() aggregate function",
                    "Filter by condition 'Excellent'",
                    "Apply WHERE clause before aggregation"
                ],
                difficultyRating: 4,
                validate: (result) => {
                    return Array.isArray(result) &&
                        result.length === 1 &&
                        result[0].sum === 3500000;
                }
            }
        ]
    }
};

// Rest of the code remains the same (executeSQLQuery, filterData, and SQLAdventureGame component)
// Only the validation logic has been updated as shown above

const executeSQLQuery = (query, database) => {
    query = query.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
    
    try {
        const tableMatch = query.match(/from\s+(\w+)/i);
        if (!tableMatch) return { error: "No table specified" };
        
        const tableName = tableMatch[1];
        const table = database[tableName];
        if (!table) return { error: `Table '${tableName}' not found` };
        
        const selectAllMatch = query.match(/select\s+\*\s+from\s+\w+(\s+where\s+(.+))?(\s+order\s+by\s+(.+))?/i);
        if (selectAllMatch) {
            let filteredData = selectAllMatch[2] ? filterData(table, selectAllMatch[2]) : table;
            
            if (selectAllMatch[4]) {
                const [column, direction] = selectAllMatch[4].split(/\s+/);
                filteredData = filteredData.sort((a, b) => {
                    return direction && direction.toLowerCase() === 'desc' 
                        ? b[column] - a[column] 
                        : a[column] - b[column];
                });
            }
            
            return filteredData;
        }
        
        const selectColumnsMatch = query.match(/select\s+(.+?)\s+from\s+\w+(\s+where\s+(.+))?(\s+order\s+by\s+(.+))?/i);
        if (selectColumnsMatch) {
            const columns = selectColumnsMatch[1].split(',').map(col => col.trim());
            
            if (columns[0].startsWith('distinct')) {
                const distinctColumn = columns[0].replace('distinct', '').trim();
                const filteredData = selectColumnsMatch[3] 
                    ? filterData(table, selectColumnsMatch[3]) 
                    : table;
                return [...new Set(filteredData.map(row => row[distinctColumn]))].map(val => ({ [distinctColumn]: val }));
            }
            
            if (columns[0].match(/count|sum|avg/i)) {
                const aggregateFunc = columns[0].match(/(\w+)\(/)[1].toLowerCase();
                const column = columns[0].match(/\((\w+)\)/)[1];
                
                let filteredData = selectColumnsMatch[3] 
                    ? filterData(table, selectColumnsMatch[3]) 
                    : table;
                
                if (aggregateFunc === 'count') {
                    return [{ count: filteredData.length }];
                }
                
                if (aggregateFunc === 'sum') {
                    const sum = filteredData.reduce((acc, row) => acc + row[column], 0);
                    return [{ sum }];
                }
                
                if (aggregateFunc === 'avg') {
                    const avg = filteredData.reduce((acc, row) => acc + row[column], 0) / filteredData.length;
                    return [{ avg }];
                }
            }
            
            let filteredData = selectColumnsMatch[3] 
                ? filterData(table, selectColumnsMatch[3]) 
                : table;
            
            if (selectColumnsMatch[5]) {
                const [column, direction] = selectColumnsMatch[5].split(/\s+/);
                filteredData = filteredData.sort((a, b) => {
                    return direction && direction.toLowerCase() === 'desc' 
                        ? b[column] - a[column] 
                        : a[column] - b[column];
                });
            }
            
            return filteredData.map(row => {
                const result = {};
                columns.forEach(col => {
                    result[col] = row[col];
                });
                return result;
            });
        }
        
        return { error: "Unsupported query format" };
    } catch (error) {
        return { error: `Query execution error: ${error.message}` };
    }
};

const filterData = (data, whereClause) => {
    try {
        whereClause = whereClause.toLowerCase().replace(/\s+/g, ' ').trim();
        
        const comparisonTypes = [
            { regex: /(\w+)\s*>\s*(-?\d+)/, handler: (data, column, value) => 
                data.filter(row => row[column] > parseFloat(value)) 
            },
            { regex: /(\w+)\s*<\s*(-?\d+)/, handler: (data, column, value) => 
                data.filter(row => row[column] < parseFloat(value)) 
            },
            { regex: /(\w+)\s*=\s*'?([^'\s]+)'?/, handler: (data, column, value) => 
                data.filter(row => row[column] == value) 
            },
            { regex: /(\w+)\s+like\s+'([^']+)'/, handler: (data, column, pattern) => {
                const regexPattern = pattern.replace(/%/g, '.*').replace(/_/g, '.');
                const regex = new RegExp(`^${regexPattern}$`, 'i');
                return data.filter(row => regex.test(row[column]));
            }},
            { regex: /(\w+)\s+between\s+(-?\d+)\s+and\s+(-?\d+)/, handler: (data, column, min, max) => 
                data.filter(row => row[column] >= parseFloat(min) && row[column] <= parseFloat(max)) 
            }
        ];
        
        for (const comp of comparisonTypes) {
            const match = whereClause.match(comp.regex);
            if (match) {
                const args = [data, ...match.slice(1)];
                return comp.handler(...args);
            }
        }
        
        return data;
    } catch (error) {
        console.error("Filtering error:", error);
        return data;
    }
};


function SQLAdventureGame() {
    const [gameLevel, setGameLevel] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [userQuery, setUserQuery] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [queryResult, setQueryResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [taskIndex, setTaskIndex] = useState(0);
    const [isGameCompleted, setIsGameCompleted] = useState(false);

    useEffect(() => {
        if (gameLevel) {
            resetLevel();
        }
    }, [gameLevel]);

    const resetLevel = () => {
        setCurrentTask(gameLevel.tasks[0]);
        setTaskIndex(0);
        setScore(0);
        setFeedback('');
        setUserQuery('');
        setQueryResult(null);
        setShowResult(false);
        setIsGameCompleted(false);
    };

    const executeQuery = () => {
        if (!gameLevel) return null;
        
        try {
            const result = executeSQLQuery(userQuery, gameLevel.database);
            setQueryResult(result);
            setShowResult(true);
            return result;
        } catch (error) {
            setQueryResult({ error: "Query execution error" });
            setShowResult(true);
            return { error: "Query execution error" };
        }
    };

    const checkAnswer = () => {
        const result = executeQuery();
        
        if (result && !result.error) {
            const isValid = validateQueryResult(result, currentTask);
            
            if (isValid) {
                const scoreIncrease = currentTask.difficultyRating * 10;
                setScore(prev => prev + scoreIncrease);
                setFeedback(`✅ Correct! +${scoreIncrease} points`);
                
                const nextTaskIndex = taskIndex + 1;
                if (nextTaskIndex < gameLevel.tasks.length) {
                    setCurrentTask(gameLevel.tasks[nextTaskIndex]);
                    setTaskIndex(nextTaskIndex);
                    setUserQuery('');
                    setQueryResult(null);
                    setShowResult(false);
                } else {
                    setIsGameCompleted(true);
                    setFeedback(`🏆 Level Completed! Total Score: ${score + scoreIncrease}`);
                }
            } else {
                setFeedback('❌ Incorrect result. Your query ran but didn\'t solve the task correctly.');
                console.log("Invalid result:", queryResult);
            }
        } else {
            setFeedback(`❌ ${result?.error || 'Invalid query. Check your syntax and try again!'}`);
        }
    };

    const renderQueryResults = () => {
        if (!showResult || !queryResult) return null;
        
        if (queryResult.error) {
            return (
                <div className="query-result error">
                    <h3>Error</h3>
                    <p>{queryResult.error}</p>
                </div>
            );
        }
        
        if (Array.isArray(queryResult) && queryResult.length === 0) {
            return (
                <div className="query-result">
                    <h3>Result</h3>
                    <p>No results found</p>
                </div>
            );
        }
        
        return (
            <div className="query-result">
                <h3>Result</h3>
                <div className="result-table-container">
                    <table className="result-table">
                        <thead>
                            <tr>
                                {Object.keys(queryResult[0]).map(key => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {queryResult.map((row, idx) => (
                                <tr key={idx}>
                                    {Object.values(row).map((value, i) => (
                                        <td key={i}>{value !== null ? value.toString() : 'NULL'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    if (!gameLevel) {
        return (
            <>
                <EnhancedAnimation />
                <Chatbot/>
                <div className="game-level-selection">
                    <h1>SQL Adventure Game</h1>
                    <div className="level-options">
                        {Object.values(GAME_LEVELS).map(level => (
                            <button 
                                key={level.name} 
                                onClick={() => setGameLevel(level)}
                                className="level-button"
                            >
                                <h2>{level.name.split(':')[0]}</h2>
                                <p>{level.description || level.name.split(':')[1]}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <EnhancedAnimation />
            <Chatbot/>
            <div className="sql-adventure-container">
                <div className="game-header">
                    <h1>{gameLevel.name}</h1>
                    <div className="score-tracker">
                        <span>Score: {score}</span>
                        <button onClick={() => setGameLevel(null)}>Change Level</button>
                        <button onClick={resetLevel}>Reset Level</button>
                    </div>
                </div>

                {isGameCompleted ? (
                    <div className="game-completed">
                        <h2>🎉 Congratulations! 🎉</h2>
                        <p>You've completed the {gameLevel.name}!</p>
                        <p>Total Score: {score}</p>
                        <button onClick={() => setGameLevel(null)}>Choose Another Level</button>
                    </div>
                ) : (
                    <div className="game-content">
                        <div className="task-section">
                            <h2>Current Task</h2>
                            {currentTask ? (
                                <>
                                    <p>{currentTask.question}</p>
                                    <div className="hints">
                                        <strong>Hints:</strong>
                                        <ul>
                                            {currentTask.hints.map((hint, index) => (
                                                <li key={index}>{hint}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <textarea
                                        value={userQuery}
                                        onChange={(e) => setUserQuery(e.target.value)}
                                        placeholder="Write your SQL query here..."
                                    ></textarea>
                                    <button onClick={checkAnswer}>Submit Query</button>
                                </>
                            ) : (
                                <p>Loading task...</p>
                            )}
                            <p className={`feedback ${feedback.startsWith('✅') ? 'correct' : 'incorrect'}`}>
                                {feedback}
                            </p>
                        </div>

                        <div className="database-preview">
                            <h2>Database Preview</h2>
                            {Object.entries(gameLevel.database).map(([tableName, tableData]) => (
                                <div key={tableName} className="table-preview">
                                    <h3>{tableName.toUpperCase()}</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                {Object.keys(tableData[0]).map(col => (
                                                    <th key={col}>{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.slice(0, 3).map((row, idx) => (
                                                <tr key={idx}>
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i}>{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {renderQueryResults()}
            </div>
        </>
    );
}

export default SQLAdventureGame;