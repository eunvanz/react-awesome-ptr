# 1.0.51 (2021-12-14)

- enhance `CupertinoSpinner`

# 1.0.50 (2021-12-13)

- fix README

# 1.0.49 (2021-12-12)

- tune `CupertinoSpinner` component

# 1.0.48 (2021-12-12)

- add `classnames` to dependencies

# 1.0.47 (2021-12-12)

- add `isOpacityChangeOnPullDisabled`, `isRotationSpinnerOnPullDisabled` props
- add `CupertinoSpinner` component

# 1.0.46 (2021-12-11)

- fix to prevent default event on `touchmove` properly

# 1.0.45 (2021-11-21)

- support SSR

# 1.0.44 (2021-11-11)

- modify cubic-bezier for virtual bounce animation

# 1.0.43 (2021-11-04)

- fix `hideDelay` option to be work properly

# 1.0.42 (2021-11-04)

- fix touch event callbacks timing issue

# 1.0.41 (2021-11-01)

- make overriding spinner style to be possible

# 1.0.40 (2021-10-27)

- fix bugs caused by invalid timeout

# 1.0.39 (2021-10-27)

- fix bug not returning to progress height after pulling

# 1.0.38 (2021-10-25)

- tuned some numbers related to motion
- refactored internal function

# 1.0.37 (2021-10-25)

- fixed `spinnerZIndex` prop passing to wrong element

# 1.0.36 (2021-10-21)

- make artificial bounce more more natural

# 1.0.35 (2021-10-21)

- make artificial bounce more natural

# 1.0.34 (2021-10-20)

- added `isDisabled` prop

# 1.0.33 (2021-10-10)

- fixed not working `e.preventDefault` due to `requestAnimationFrame`

# 1.0.32 (2021-10-10)

- applied `requestAnimationFrame` to `touchmove` callback function for performance

# 1.0.31 (2021-10-07)

- changed position from `absolute` to `fixed` in for-no-bounce case, same as for-bounce case

# 1.0.30 (2021-10-06)

- fixed spinner to ensure not to be spinning after pull-to-refresh container height is reset

# 1.0.29 (2021-10-04)

- added `hideDelay` prop
