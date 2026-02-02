import React, { useCallback, useEffect, useState, useRef } from 'react'
import {
    Bodies,
    Body,
    Composite,
    Engine,
    Events,
    IEventCollision,
    Render,
    Runner,
    World
} from 'matter-js';

import { config } from '../../config'
import { Multipliers } from '../../config/multipliers'
import { useAuthStore } from '../../store/auth'
import { useGameStore } from '../../store/game'

import { random } from '../../utils/random'
import { MultiplierValues, BetType } from '../../@types'

import { BetActions } from '../BetActions'
import PlinkoGameBody from '../GameBody'
import { MultiplierHistory } from '../MultiplierHistory'

import { socket } from '../../socket';

interface MultiplierHistoryType {
    type: BetType,
    value: number
}

const Game = () => {
    // #region States
    const engine = Engine.create()
    const inGameBallsCount = useGameStore(state => state.gamesRunning)
    const authUser = useAuthStore((state: any) => state.user)
    const setBalance = useAuthStore(state => state.setBalance)
    const incrementInGameBallsCount = useGameStore(
        state => state.incrementGamesRunning
    )
    const decrementInGameBallsCount = useGameStore(
        state => state.decrementGamesRunning
    )
    const [lastMultipliers, setLastMultipliers] = useState<MultiplierHistoryType[]>([])

    const lines = 16;
    const {
        pins: pinsConfig,
        colors,
        ball: ballConfig,
        engine: engineConfig,
        world: worldConfig,
        ColorsPerBet
    } = config

    const userIdRef = useRef<string>('');

    const worldWidth: number = worldConfig.width
    const worldHeight: number = worldConfig.height
    // #endregion

    useEffect(() => {
        engine.gravity.y = engineConfig.engineGravity
        const element = document.getElementById('plinko')
        const render = Render.create({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            element: element!,
            bounds: {
                max: {
                    y: worldHeight,
                    x: worldWidth
                },
                min: {
                    y: 0,
                    x: 0
                }
            },
            options: {
                background: colors.background,
                hasBounds: true,
                width: worldWidth,
                height: worldHeight,
                wireframes: false
            },
            engine
        })
        const runner = Runner.create({
            delta: 1000 / 60,
            isFixed: true
        })
        Runner.run(runner, engine)
        Render.run(render)
        return () => {
            World.clear(engine.world, true)
            Engine.clear(engine)
            render.canvas.remove()
            render.textures = {}
        }
    }, [])

    const pins: Body[] = []

    for (let l = 0; l < lines; l++) {
        const linePins = pinsConfig.startPins + l
        const lineWidth = linePins * pinsConfig.pinGap
        for (let i = 0; i < linePins; i++) {
            const pinX =
                worldWidth / 2 -
                lineWidth / 2 +
                i * pinsConfig.pinGap +
                pinsConfig.pinGap / 2

            const pinY =
                worldWidth / lines + l * pinsConfig.pinGap + pinsConfig.pinGap

            const pin = Bodies.circle(pinX, pinY, pinsConfig.pinSize, {
                label: `pin-${i}`,
                render: {
                    fillStyle: '#F5DCFF'
                },
                isStatic: true
            })
            pins.push(pin)
        }
    }

    function addInGameBall() {
        incrementInGameBallsCount()
    }

    function removeInGameBall() {
        decrementInGameBallsCount()
    }

    const getBallColor = (value: number, type: string) => {
        if (value <= 0) {
            return colors.text
        } else {
            switch (type) {
                case 'easy':
                    return ColorsPerBet.easy.color;
                case 'medium':
                    return ColorsPerBet.medium.color;
                case 'diff':
                    return ColorsPerBet.diff.color;
                default:
                    return colors.text
            }
        }
    }

    const addBall = useCallback(
        (type: string, ballId: number, point: number, score: number) => {
            addInGameBall()
            const ballX = point;

            const ballColor = getBallColor(ballId, type);
            const ball = Bodies.circle(ballX, 20, ballConfig.ballSize, {
                restitution: 1,
                friction: 0,
                label: `ball-${ballId}-${type}-${score}`,
                id: new Date().getTime(),
                frictionAir: 0.05,
                collisionFilter: {
                    group: -1
                },
                render: {
                    fillStyle: ballColor
                },
                isStatic: false
            })
            Composite.add(engine.world, ball)
        },
        [lines]
    )

    const leftWall = Bodies.rectangle(
        worldWidth / 3 - pinsConfig.pinSize * pinsConfig.pinGap - pinsConfig.pinGap + 25,
        worldWidth / 2 - pinsConfig.pinSize,
        worldWidth,
        40,
        {
            angle: 90,
            render: {
                visible: false
            },
            isStatic: true
        }
    )

    const leftWall1 = Bodies.rectangle(
        pinsConfig.pinGap - 11,
        worldWidth / 2 - pinsConfig.pinSize,
        worldWidth,
        40,
        {
            angle: 90 * Math.PI / 180,
            render: {
                visible: false
            },
            isStatic: true
        }
    )

    const rightWall = Bodies.rectangle(
        worldWidth - pinsConfig.pinSize * pinsConfig.pinGap - pinsConfig.pinGap - pinsConfig.pinGap / 2 + 30,
        worldWidth / 2 - pinsConfig.pinSize,
        worldWidth * 1,
        40,
        {
            angle: -90,
            render: {
                visible: false
            },
            isStatic: true
        }
    )

    const rightWall1 = Bodies.rectangle(
        worldWidth - 19,
        worldWidth / 2 - pinsConfig.pinSize,
        worldWidth * 1,
        40,
        {
            angle: 90 * Math.PI / 180,
            render: {
                visible: false
            },
            isStatic: true
        }
    )

    const floor = Bodies.rectangle(0, worldWidth - 40, worldWidth * 10, 40, {
        label: 'block-1',
        render: {
            visible: false,
            fillStyle: 'rgba(0,0,0,0.6)'
        },
        isStatic: true
    })

    const multipliers = Multipliers as any;

    const multipliersBodies_easy: Body[] = []
    const multipliersBodies_medium: Body[] = []
    const multipliersBodies_diff: Body[] = []

    let lastMultiplierX_easy: number, lastMultiplierX_medium: number, lastMultiplierX_diff: number

    lastMultiplierX_easy = lastMultiplierX_medium = lastMultiplierX_diff = worldWidth / 2 - (pinsConfig.pinGap / 2) * lines - pinsConfig.pinGap

    for(const key in multipliers['easy']){
        let multiplier = multipliers['easy'][key];

        const blockSize = 30 // height and width
        const multiplierBody = Bodies.rectangle(
            lastMultiplierX_easy + 30,
            worldWidth / lines + lines * pinsConfig.pinGap + pinsConfig.pinGap,
            blockSize,
            blockSize,
            {
                label: multiplier.label,
                isStatic: true,
                render: {
                    sprite: {
                        xScale: 1.4,
                        yScale: 1.1,
                        texture: multiplier.img
                    }
                }
            }
        )
        lastMultiplierX_easy = multiplierBody.position.x
        multipliersBodies_easy.push(multiplierBody)
    }

    for(const key in multipliers['medium']){
        let multiplier = multipliers['medium'][key];

        const blockSize = 30 // height and width
        const multiplierBody = Bodies.rectangle(
            lastMultiplierX_medium + 30,
            worldWidth / lines + lines * pinsConfig.pinGap + pinsConfig.pinGap + 25,
            blockSize,
            blockSize,
            {
                label: multiplier.label,
                isStatic: true,
                render: {
                    sprite: {
                        xScale: 1.4,
                        yScale: 1.1,
                        texture: multiplier.img
                    }
                }
            }
        )
        lastMultiplierX_medium = multiplierBody.position.x
        multipliersBodies_medium.push(multiplierBody)
    }

    for(const key in multipliers['diff']){
        let multiplier = multipliers['diff'][key];
        const blockSize = 30 // height and width
        const multiplierBody = Bodies.rectangle(
            lastMultiplierX_diff + 30,
            worldWidth / lines + lines * pinsConfig.pinGap + pinsConfig.pinGap + 50,
            blockSize,
            blockSize,
            {
                label: multiplier.label,
                isStatic: true,
                render: {
                    sprite: {
                        xScale: 1.4,
                        yScale: 1.1,
                        texture: multiplier.img
                    }
                }
            }
        )
        lastMultiplierX_diff = multiplierBody.position.x
        multipliersBodies_diff.push(multiplierBody)
    }

    Composite.add(engine.world, [
        ...pins,
        ...multipliersBodies_easy,
        ...multipliersBodies_medium,
        ...multipliersBodies_diff,
        leftWall,
        leftWall1,
        rightWall,
        rightWall1,
        floor
    ])

    function bet(key: BetType, betValue: number) {
        try{
            socket.emit('play-bet', {
                ballId: new Date().valueOf(),
                userId: authUser.id,
                difficulty: key,
                betAmount: betValue
            })
        }catch(err){
            console.error('play bet error', err)
        }
    }

    async function onCollideWithMultiplier(ball: Body, multiplier: Body, authUser: any) {
        ball.collisionFilter.group = 2
        World.remove(engine.world, ball)
        removeInGameBall()
        const ballInfo = ball.label.split('-') as string[];
        const ballId = ballInfo[1]
        const multiplierValue = Number(ballInfo[3]) as MultiplierValues
        const betType = ballInfo[2] as BetType;

        try{
            socket.emit('end-bet', {
                userId: userIdRef.current,
                ballId: ballId
            })
        }catch(err){
            console.error('end-bet socket error', err)
        }

        setLastMultipliers(prev => [{ type: betType, value: multiplierValue }, prev[0], prev[1], prev[2]])
    }

    async function onBodyCollision(event: IEventCollision<Engine>, authUser: any) {
        const pairs = event.pairs
        for (const pair of pairs) {
            const { bodyA, bodyB } = pair
            if (bodyB.label.includes('ball') && bodyA.label.includes('block')) {
                await onCollideWithMultiplier(bodyB, bodyA, authUser)
            }
        }
    }

    // Events.on(engine, 'collisionActive', onBodyCollision)
    useEffect(() => {
        userIdRef.current = authUser.id;
        Events.on(engine, 'collisionStart', (e) => onBodyCollision(e, authUser))

        return () => {
            Events.off(engine, 'collisionStart', () => {})
        }
    }, [authUser])
 
    useEffect(() => {
        socket.on('bet-result', (data: any) => {
            setBalance(data.balance);
            addBall(data.difficulty, data.ballId, data.point, data.target)
        })

        socket.on('balance', (data) => {
            setBalance(data.balance);
        })

        return () => {
            socket.off('bet-result');
            socket.off('balance');
        };
    }, [])

    return (
        <div className="flex relative md:w-[50%] md:min-w-[430px] max-w-[100vw] sm:max-w-[600px] mx-auto h-fit flex-col items-center justify-center overflow-hidden gap-[5px] px-0 lg:px-[15px] mt-[-40px]">
            <div className="flex flex-1 items-center justify-center relative x-game-panel">
                {/* <span className="absolute left-[40px] top-[60px] mx-auto text-xs font-bold text-text md:text-base">
                    *Balls in play {inGameBallsCount}/15
                </span> */}
                <PlinkoGameBody />
            </div>
            <BetActions
                inGameBallsCount={inGameBallsCount}
                onRunBet={bet}
            />
            <MultiplierHistory multiplierHistory={lastMultipliers} />
        </div>
    )
}

export default Game;