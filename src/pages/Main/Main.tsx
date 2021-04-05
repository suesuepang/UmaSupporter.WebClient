import React, { useEffect, useReducer } from "react";
import SelectedCardListContainer from "../../components/SelectedCardList";
import SupportCardListContainer from "../../components/SupportCardList";
import SupportCardDetailContainer from "../../components/SupportCardDetail";
import UmaListContainer from "../../components/UmaList";
import "./Main.scss";
import UmaDetailContainer from "../../components/UmaDetail";
import { Mixpanel, TRACK } from "../../common/mixpanel";

type SetUmaAction = {
  type: 'SET_UMA_ACTION',
  payload: number
}

type AppendAction = {
  type: 'APPEND_CARD',
  payload: number
}

type DeleteAction = {
  type: 'DELETE_CARD',
  payload: number
}

type SetCardAction = {
  type: 'SET_CARD',
  payload: number
}

type ResetAction = {
  type: 'RESET',
}

const resetState = (): State => {
  return {
    favoriteCardUuids: [],
    cardUuid: 0,
    umaUuid: 0,
  }
}

type Action = AppendAction 
              | DeleteAction 
              | ResetAction 
              | SetUmaAction 
              | SetCardAction

type State = {
  favoriteCardUuids: number[],
  umaUuid: number,
  cardUuid: number
}

const selectedCardReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_UMA_ACTION':
      return {
        favoriteCardUuids: state.favoriteCardUuids,
        umaUuid: action.payload,
        cardUuid: state.cardUuid
      }
    case 'APPEND_CARD':
      if(state.favoriteCardUuids.length >= 6) return state;
      if(state.favoriteCardUuids.includes(action.payload)) return state;
      return {
        favoriteCardUuids: [...state.favoriteCardUuids, action.payload],
        umaUuid: state.umaUuid,
        cardUuid: state.cardUuid
      }
    case 'DELETE_CARD':
      return {
        favoriteCardUuids: state.favoriteCardUuids.filter(x => x !== action.payload),
        umaUuid: state.umaUuid,
        cardUuid: state.cardUuid
      };
    case 'SET_CARD':
      return {
        favoriteCardUuids: state.favoriteCardUuids,
        umaUuid: state.umaUuid,
        cardUuid: action.payload
      }
    case 'RESET':
      return resetState()
    default:
      throw new Error('Unhandled action');
  }
}

const Main: React.FC = () => {
  const [state, dispatch] = useReducer(selectedCardReducer, {cardUuids: [], cardType: ""}, resetState);

  const addFavoriteCard = (uuid: number) => { Mixpanel.track(TRACK.SET_FAVORITE, {uuid: uuid}); dispatch({ type: 'APPEND_CARD', payload: uuid })}
  const deleteCard = (uuid: number) => dispatch({ type: 'DELETE_CARD', payload: uuid })
  const resetCard = () => dispatch({ type: 'RESET' })
  const setUmamusume = (uuid: number) => { Mixpanel.track(TRACK.SET_UMA, {uuid: uuid}); dispatch({ type: 'SET_UMA_ACTION', payload: uuid })} 
  const setCard = (uuid: number) => { Mixpanel.track(TRACK.SET_CARD, {uuid: uuid}); dispatch({ type: 'SET_CARD', payload: uuid })}

  useEffect(() => {
    Mixpanel.track(TRACK.MAINPAGE, {})
  }, [])

  return (
    <div className={"MainPage"}>
      <div className={"UmaListSection"}>
        <UmaListContainer
          onClickItem={setUmamusume}
        />
      </div>
      <div className={"CardList"}>
        <div>
          <p className={"MainPagelabel"}>
            즐겨찾기
          </p>
          <SelectedCardListContainer 
          onClickItem={setCard}
          selectedList={state.favoriteCardUuids} 
          onDeleteItem={deleteCard}
          onResetItem={resetCard}/>
        </div>
        {/* <div className={"MainPageRecentCard"}>
          <p className={"MainPagelabel"}>
          최근 선택한 카드
          </p>
        </div> */}
        <div className={"MainPageCardList"}>
          <p className={"MainPagelabel"}>
          카드 리스트
          </p>
        </div>
        <div className={"CardListGrid"}>
          <SupportCardListContainer
          onClickItem={setCard}
          onDoubleClickItem={addFavoriteCard}
          selectedList={state.favoriteCardUuids}
          />
        </div>
      </div>
      <div className={"UmaEventArea"}>
        <div className={"UmaEventChoice EventChoice"}>
          <UmaDetailContainer uuid={state.umaUuid} />
        </div>
          
        <div className={"CardEventChoice EventChoice"}>
          <SupportCardDetailContainer uuid={state.cardUuid}/>
        </div>
      </div>
    </div>
  )
}

export default Main;
