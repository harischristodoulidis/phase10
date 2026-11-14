import { useNavigate } from 'react-router';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { gameStarted } from '@features/game';

import arrowRightIcon from '@assets/icons/arrow-right.svg';
import { Button } from '@ui/Button';
import { Icon } from '@ui/Icon';

import { SETUP_COPY } from '../constants';
import { selectActiveNames, selectCanStart } from '../selectors';

export function StartGameButton() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const names = useAppSelector(selectActiveNames);
  const canStart = useAppSelector(selectCanStart);

  function startGame() {
    dispatch(gameStarted(names));
    void navigate('/game');
  }

  return (
    <Button
      size="lg"
      disabled={!canStart}
      onClick={startGame}
      endIcon={<Icon src={arrowRightIcon} />}
    >
      {SETUP_COPY.startGame}
    </Button>
  );
}
