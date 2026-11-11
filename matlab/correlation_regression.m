function regRes = correlation_regression(x, y)
% CORRELATION_REGRESSION Computes Pearson correlation and Ordinary Least Squares
% linear regression between active users (x) and bandwidth utilization percentage (y).
% Formulas:
%   r = Cov(X,Y) / (sigma_x * sigma_y)
%   y_hat = a + b*x, where b = Cov(X,Y)/Var(X), a = \bar{y} - b*\bar{x}
%   R^2 = r^2

    n = length(x);
    if length(y) ~= n || n < 2
        error('Input vectors must be of equal length >= 2.');
    end

    x_mean = mean(x);
    y_mean = mean(y);

    dx = x - x_mean;
    dy = y - y_mean;

    SS_xx = sum(dx.^2);
    SS_yy = sum(dy.^2);
    SS_xy = sum(dx .* dy);

    % Pearson correlation coefficient r
    r = SS_xy / sqrt(SS_xx * SS_yy);

    % Regression parameters: y = a + b*x
    b = SS_xy / SS_xx;
    a = y_mean - b * x_mean;

    % Predicted y and residuals
    y_pred = a + b * x;
    SS_res = sum((y - y_pred).^2);
    SS_tot = SS_yy;
    R2 = 1 - (SS_res / SS_tot);

    regRes.n = n;
    regRes.r = r;
    regRes.slope_b = b;
    regRes.intercept_a = a;
    regRes.R2 = R2;
    regRes.y_pred = y_pred;

    fprintf('--- MODULE IV: CORRELATION & LINEAR REGRESSION ---\n');
    fprintf('Predictor (X): Active Users | Response (Y): Bandwidth Utilization (%%)\n');
    fprintf('Pearson Correlation (r):  %.4f\n', r);
    fprintf('Regression Equation:      Y = %.4f + %.4f * X\n', a, b);
    fprintf('Coefficient of Determ. R2: %.4f (%.2f%% variance explained)\n\n', R2, R2 * 100);
end
